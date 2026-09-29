<?php
/**
 * WP-CLI migration command: Supabase (Postgres) -> WordPress.
 *
 * Loaded only when WP-CLI is present. Reads JSON files you export from Supabase
 * and creates the equivalent WordPress content.
 *
 * EXPORT FROM SUPABASE (run in the Supabase SQL editor, "Download as JSON",
 * or via `supabase db dump` + a JSON query). Save each result as a file:
 *
 *   categories.json  <- select * from public.categories;
 *   products.json    <- select p.*, c.slug as category_slug from public.products p
 *                          left join public.categories c on c.id = p.category_id;
 *   resources.json   <- select * from public.resources;
 *   users.json       <- select u.id, u.email, pr.first_name, pr.last_name, pr.company,
 *                          pr.job_title, pr.country, pr.phone,
 *                          (select array_agg(role) from public.user_roles r where r.user_id=u.id) as roles
 *                          from auth.users u left join public.profiles pr on pr.id = u.id;
 *
 * RUN:
 *   wp synthera migrate --dir=/path/to/exports
 *   wp synthera migrate --dir=/path/to/exports --only=products
 *
 * Notes:
 *  - Idempotent: matches on slug (content) or email (users); updates instead of duplicating.
 *  - Passwords cannot be migrated from Supabase (hashes are incompatible). Imported
 *    users are created without a usable password; use --notify to email password-reset links.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! ( defined( 'WP_CLI' ) && WP_CLI ) ) {
	return;
}

class SYNP_Migrate_CLI {

	/**
	 * Migrate Supabase exports into WordPress.
	 *
	 * ## OPTIONS
	 *
	 * --dir=<dir>
	 * : Directory containing the exported JSON files.
	 *
	 * [--only=<entity>]
	 * : Limit to one of: categories, products, resources, users.
	 *
	 * [--notify]
	 * : Send new-user / password-reset notifications when creating users.
	 *
	 * @when after_wp_load
	 */
	public function migrate( $args, $assoc ) {
		$dir = isset( $assoc['dir'] ) ? rtrim( $assoc['dir'], '/' ) : '';
		if ( ! $dir || ! is_dir( $dir ) ) {
			WP_CLI::error( 'Provide a valid --dir with the exported JSON files.' );
		}
		$only   = isset( $assoc['only'] ) ? $assoc['only'] : '';
		$notify = isset( $assoc['notify'] );

		$steps = array( 'categories', 'products', 'resources', 'users' );
		foreach ( $steps as $step ) {
			if ( $only && $only !== $step ) {
				continue;
			}
			$file = $dir . '/' . $step . '.json';
			if ( ! file_exists( $file ) ) {
				WP_CLI::warning( "Skipping {$step}: {$file} not found." );
				continue;
			}
			$data = json_decode( file_get_contents( $file ), true );
			if ( ! is_array( $data ) ) {
				WP_CLI::warning( "Skipping {$step}: invalid JSON." );
				continue;
			}
			$method = 'import_' . $step;
			$count  = $this->$method( $data, $notify );
			WP_CLI::success( "{$step}: processed {$count} record(s)." );
		}
	}

	protected function import_categories( $rows ) {
		$n = 0;
		foreach ( $rows as $row ) {
			$slug = sanitize_title( $row['slug'] ?? $row['name'] ?? '' );
			if ( ! $slug ) {
				continue;
			}
			$term = get_term_by( 'slug', $slug, 'syn_area' );
			if ( $term ) {
				wp_update_term( $term->term_id, 'syn_area', array( 'name' => $row['name'] ?? $slug, 'description' => $row['description'] ?? '' ) );
			} else {
				wp_insert_term( $row['name'] ?? $slug, 'syn_area', array( 'slug' => $slug, 'description' => $row['description'] ?? '' ) );
			}
			$n++;
		}
		return $n;
	}

	protected function import_products( $rows ) {
		$n = 0;
		foreach ( $rows as $row ) {
			$slug = sanitize_title( $row['slug'] ?? '' );
			if ( ! $slug ) {
				continue;
			}
			$existing = get_posts( array( 'post_type' => 'syn_product', 'name' => $slug, 'posts_per_page' => 1, 'post_status' => 'any' ) );
			$postarr  = array(
				'post_type'    => 'syn_product',
				'post_name'    => $slug,
				'post_title'   => $row['name'] ?? $slug,
				'post_content' => $row['long_desc'] ?? '',
				'post_excerpt' => $row['short_desc'] ?? '',
				'post_status'  => ( ( $row['status'] ?? 'active' ) === 'active' ) ? 'publish' : 'draft',
			);
			if ( $existing ) {
				$postarr['ID'] = $existing[0]->ID;
				$post_id       = wp_update_post( $postarr );
			} else {
				$post_id = wp_insert_post( $postarr );
			}
			if ( is_wp_error( $post_id ) || ! $post_id ) {
				continue;
			}

			update_post_meta( $post_id, 'synp_sku', $row['sku'] ?? '' );
			update_post_meta( $post_id, 'synp_product_type', $row['product_type'] ?? 'Research Compound' );
			update_post_meta( $post_id, 'synp_status', $row['status'] ?? 'active' );
			update_post_meta( $post_id, 'synp_availability', $row['availability'] ?? 'Available' );
			update_post_meta( $post_id, 'synp_short_desc', $row['short_desc'] ?? '' );
			update_post_meta( $post_id, 'synp_scientific_info', $row['scientific_info'] ?? '' );
			update_post_meta( $post_id, 'synp_therapeutic_info', $row['therapeutic_info'] ?? '' );
			update_post_meta( $post_id, 'synp_badge', $row['badge'] ?? '' );
			update_post_meta( $post_id, 'synp_featured', ! empty( $row['featured'] ) ? '1' : '0' );

			if ( ! empty( $row['category_slug'] ) ) {
				$term = get_term_by( 'slug', sanitize_title( $row['category_slug'] ), 'syn_area' );
				if ( $term ) {
					wp_set_object_terms( $post_id, array( (int) $term->term_id ), 'syn_area' );
				}
			}
			$n++;
		}
		return $n;
	}

	protected function import_resources( $rows ) {
		$n = 0;
		foreach ( $rows as $row ) {
			$slug = sanitize_title( $row['slug'] ?? '' );
			if ( ! $slug ) {
				continue;
			}
			$existing = get_posts( array( 'post_type' => 'syn_resource', 'name' => $slug, 'posts_per_page' => 1, 'post_status' => 'any' ) );
			$postarr  = array(
				'post_type'    => 'syn_resource',
				'post_name'    => $slug,
				'post_title'   => $row['title'] ?? $slug,
				'post_content' => $row['body'] ?? '',
				'post_excerpt' => $row['excerpt'] ?? '',
				'post_status'  => ! empty( $row['published'] ) ? 'publish' : 'draft',
			);
			if ( $existing ) {
				$postarr['ID'] = $existing[0]->ID;
				$post_id       = wp_update_post( $postarr );
			} else {
				$post_id = wp_insert_post( $postarr );
			}
			if ( ! is_wp_error( $post_id ) && $post_id && ! empty( $row['category'] ) ) {
				update_post_meta( $post_id, 'synp_resource_category', sanitize_text_field( $row['category'] ) );
			}
			$n++;
		}
		return $n;
	}

	protected function import_users( $rows, $notify = false ) {
		$n = 0;
		foreach ( $rows as $row ) {
			$email = sanitize_email( $row['email'] ?? '' );
			if ( ! is_email( $email ) ) {
				continue;
			}
			$roles      = isset( $row['roles'] ) && is_array( $row['roles'] ) ? $row['roles'] : array( 'customer' );
			$is_admin   = in_array( 'admin', $roles, true );
			$wp_role    = $is_admin ? 'administrator' : SYNP_CUSTOMER_ROLE;

			$user_id = email_exists( $email );
			if ( $user_id ) {
				wp_update_user( array( 'ID' => $user_id, 'role' => $wp_role ) );
			} else {
				$user_id = wp_insert_user( array(
					'user_login'   => $email,
					'user_email'   => $email,
					'user_pass'    => wp_generate_password( 24 ),
					'first_name'   => $row['first_name'] ?? '',
					'last_name'    => $row['last_name'] ?? '',
					'display_name' => trim( ( $row['first_name'] ?? '' ) . ' ' . ( $row['last_name'] ?? '' ) ),
					'role'         => $wp_role,
				) );
				if ( is_wp_error( $user_id ) ) {
					continue;
				}
				if ( $notify ) {
					wp_new_user_notification( $user_id, null, 'user' );
				}
			}
			foreach ( array( 'company', 'job_title', 'country', 'phone' ) as $meta ) {
				if ( isset( $row[ $meta ] ) ) {
					update_user_meta( $user_id, 'synp_' . $meta, sanitize_text_field( $row[ $meta ] ) );
				}
			}
			$n++;
		}
		return $n;
	}
}

WP_CLI::add_command( 'synthera', 'SYNP_Migrate_CLI' );
