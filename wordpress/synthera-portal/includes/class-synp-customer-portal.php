<?php
/**
 * Customer Portal (Supabase: /customer/* routes under the _authenticated gate).
 *
 * The public site is built in Elementor. The portal pages are ordinary WP pages
 * that contain the [synthera_portal] shortcode; this class:
 *   1. Gates any page mapped as a portal page (redirect to login if not allowed).
 *   2. Renders the portal views: dashboard, products, product detail, requests,
 *      documents, profile, support — switched by ?view= (mirrors the sub-routes).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Customer_Portal {

	public static function init() {
		add_action( 'template_redirect', array( __CLASS__, 'gate' ) );
		add_action( 'admin_post_synp_update_profile', array( __CLASS__, 'handle_profile' ) );
		add_action( 'admin_post_synp_support', array( __CLASS__, 'handle_support' ) );
	}

	/** Redirect logged-out users away from the portal page. */
	public static function gate() {
		$portal_page = (int) get_option( 'synp_portal_page', 0 );
		if ( $portal_page && is_page( $portal_page ) && ! SYNP_Helpers::can_access_portal() ) {
			SYNP_Helpers::require_portal_or_redirect();
		}
	}

	/** Main render entry (called by the [synthera_portal] shortcode). */
	public static function render() {
		if ( ! SYNP_Helpers::can_access_portal() ) {
			return '<p>' . esc_html__( 'Please sign in to access the portal.', 'synthera-portal' ) . '</p>';
		}
		$view  = isset( $_GET['view'] ) ? sanitize_key( $_GET['view'] ) : 'dashboard';
		$views = array( 'dashboard', 'products', 'product', 'requests', 'documents', 'profile', 'support' );
		if ( ! in_array( $view, $views, true ) ) {
			$view = 'dashboard';
		}

		ob_start();
		echo '<div class="synp-portal">';
		self::nav( $view );
		echo '<div class="synp-portal-body">';
		call_user_func( array( __CLASS__, 'view_' . $view ) );
		echo '</div></div>';
		return ob_get_clean();
	}

	protected static function nav( $active ) {
		$base  = get_permalink();
		$items = array(
			'dashboard' => __( 'Dashboard', 'synthera-portal' ),
			'products'  => __( 'Products', 'synthera-portal' ),
			'requests'  => __( 'Requests', 'synthera-portal' ),
			'documents' => __( 'Documents', 'synthera-portal' ),
			'profile'   => __( 'Profile', 'synthera-portal' ),
			'support'   => __( 'Support', 'synthera-portal' ),
		);
		echo '<nav class="synp-portal-nav"><ul>';
		foreach ( $items as $key => $label ) {
			$url = esc_url( add_query_arg( 'view', $key, $base ) );
			$cls = $active === $key ? ' class="active"' : '';
			echo '<li' . $cls . '><a href="' . $url . '">' . esc_html( $label ) . '</a></li>';
		}
		echo '<li><a href="' . esc_url( wp_logout_url( home_url( '/' ) ) ) . '">' . esc_html__( 'Logout', 'synthera-portal' ) . '</a></li>';
		echo '</ul></nav>';
	}

	/* ------- Views ------- */

	protected static function view_dashboard() {
		$user = wp_get_current_user();
		$products = get_posts( array( 'post_type' => 'syn_product', 'posts_per_page' => 5, 'meta_key' => 'synp_status', 'meta_value' => 'active' ) );
		$requests = SYNP_Product_Requests::for_user( $user->ID );
		echo '<h2>' . sprintf( esc_html__( 'Welcome, %s', 'synthera-portal' ), esc_html( $user->display_name ) ) . '</h2>';
		echo '<div class="synp-cards">';
		echo '<div class="synp-card"><span>' . count( $products ) . '</span>' . esc_html__( 'Recent products', 'synthera-portal' ) . '</div>';
		echo '<div class="synp-card"><span>' . count( $requests ) . '</span>' . esc_html__( 'Your requests', 'synthera-portal' ) . '</div>';
		echo '</div>';
		echo '<h3>' . esc_html__( 'Recently added products', 'synthera-portal' ) . '</h3><ul>';
		foreach ( $products as $p ) {
			$url = esc_url( add_query_arg( array( 'view' => 'product', 'id' => $p->ID ), get_permalink() ) );
			echo '<li><a href="' . $url . '">' . esc_html( get_the_title( $p ) ) . '</a></li>';
		}
		echo '</ul>';
	}

	protected static function view_products() {
		$search = isset( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
		$area   = isset( $_GET['area'] ) ? sanitize_title( wp_unslash( $_GET['area'] ) ) : '';

		$args = array(
			'post_type'      => 'syn_product',
			'posts_per_page' => 24,
			's'              => $search,
			'meta_query'     => array( array( 'key' => 'synp_status', 'value' => 'active' ) ),
		);
		if ( $area ) {
			$args['tax_query'] = array( array( 'taxonomy' => 'syn_area', 'field' => 'slug', 'terms' => $area ) );
		}
		$q = new WP_Query( $args );

		echo '<form method="get" class="synp-filters">';
		echo '<input type="hidden" name="view" value="products" />';
		echo '<input type="search" name="q" value="' . esc_attr( $search ) . '" placeholder="' . esc_attr__( 'Search products', 'synthera-portal' ) . '" />';
		wp_dropdown_categories( array( 'taxonomy' => 'syn_area', 'name' => 'area', 'show_option_all' => __( 'All areas', 'synthera-portal' ), 'value_field' => 'slug', 'selected' => $area, 'hide_empty' => false ) );
		echo '<button type="submit">' . esc_html__( 'Filter', 'synthera-portal' ) . '</button></form>';

		echo '<div class="synp-product-grid">';
		while ( $q->have_posts() ) {
			$q->the_post();
			$url = esc_url( add_query_arg( array( 'view' => 'product', 'id' => get_the_ID() ), get_permalink() ) );
			echo '<a class="synp-product-card" href="' . $url . '">';
			if ( has_post_thumbnail() ) {
				echo get_the_post_thumbnail( get_the_ID(), 'medium' );
			}
			echo '<h4>' . esc_html( get_the_title() ) . '</h4>';
			echo '<p>' . esc_html( get_post_meta( get_the_ID(), 'synp_short_desc', true ) ) . '</p></a>';
		}
		wp_reset_postdata();
		echo '</div>';
	}

	protected static function view_product() {
		$id = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;
		$p  = $id ? get_post( $id ) : null;
		if ( ! $p || 'syn_product' !== $p->post_type ) {
			echo '<p>' . esc_html__( 'Product not found.', 'synthera-portal' ) . '</p>';
			return;
		}
		echo '<h2>' . esc_html( get_the_title( $p ) ) . '</h2>';
		echo '<div class="synp-product-detail">' . wp_kses_post( apply_filters( 'the_content', $p->post_content ) ) . '</div>';

		$sci = get_post_meta( $id, 'synp_scientific_info', true );
		if ( $sci ) {
			echo '<h3>' . esc_html__( 'Science', 'synthera-portal' ) . '</h3><p>' . esc_html( $sci ) . '</p>';
		}

		$docs = SYNP_Documents::for_product( $id );
		if ( $docs ) {
			echo '<h3>' . esc_html__( 'Documents', 'synthera-portal' ) . '</h3><ul>';
			foreach ( $docs as $doc ) {
				echo '<li><a href="' . esc_url( SYNP_Documents::download_url( $doc->id ) ) . '">' . esc_html( $doc->title ) . ' (' . esc_html( $doc->doc_type ) . ')</a></li>';
			}
			echo '</ul>';
		}

		// Request Information form.
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="synp-form">';
		echo '<input type="hidden" name="action" value="synp_product_request" />';
		echo '<input type="hidden" name="product_id" value="' . esc_attr( $id ) . '" />';
		wp_nonce_field( 'synp_product_request', 'synp_preq_nonce' );
		echo '<label>' . esc_html__( 'Request Information', 'synthera-portal' ) . '<textarea name="message" rows="4"></textarea></label>';
		echo '<button type="submit">' . esc_html__( 'Submit request', 'synthera-portal' ) . '</button></form>';
	}

	protected static function view_requests() {
		$rows = SYNP_Product_Requests::for_user( get_current_user_id() );
		echo '<h2>' . esc_html__( 'Your Requests', 'synthera-portal' ) . '</h2>';
		if ( ! $rows ) {
			echo '<p>' . esc_html__( 'No requests yet.', 'synthera-portal' ) . '</p>';
			return;
		}
		echo '<table class="synp-table"><thead><tr><th>' . esc_html__( 'Product', 'synthera-portal' ) . '</th><th>' . esc_html__( 'Status', 'synthera-portal' ) . '</th><th>' . esc_html__( 'Date', 'synthera-portal' ) . '</th></tr></thead><tbody>';
		foreach ( $rows as $r ) {
			$title = $r->product_id ? get_the_title( $r->product_id ) : __( 'General', 'synthera-portal' );
			echo '<tr><td>' . esc_html( $title ) . '</td><td><span class="synp-status synp-status-' . esc_attr( $r->status ) . '">' . esc_html( SYNP_Helpers::status_label( $r->status ) ) . '</span></td><td>' . esc_html( $r->created_at ) . '</td></tr>';
		}
		echo '</tbody></table>';
	}

	protected static function view_documents() {
		echo '<h2>' . esc_html__( 'Documents', 'synthera-portal' ) . '</h2>';
		global $wpdb;
		$table = SYNP_Schema::table( 'product_documents' );
		$docs  = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY created_at DESC LIMIT 100" );
		if ( ! $docs ) {
			echo '<p>' . esc_html__( 'No documents available.', 'synthera-portal' ) . '</p>';
			return;
		}
		echo '<ul>';
		foreach ( $docs as $doc ) {
			echo '<li><a href="' . esc_url( SYNP_Documents::download_url( $doc->id ) ) . '">' . esc_html( $doc->title ) . '</a> — ' . esc_html( get_the_title( $doc->product_id ) ) . '</li>';
		}
		echo '</ul>';
	}

	protected static function view_profile() {
		$user = wp_get_current_user();
		if ( isset( $_GET['synp_profile'] ) && 'ok' === $_GET['synp_profile'] ) {
			echo '<div class="synp-notice">' . esc_html__( 'Profile updated.', 'synthera-portal' ) . '</div>';
		}
		echo '<h2>' . esc_html__( 'Profile', 'synthera-portal' ) . '</h2>';
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="synp-form">';
		echo '<input type="hidden" name="action" value="synp_update_profile" />';
		wp_nonce_field( 'synp_update_profile', 'synp_profile_nonce' );
		self::text_field( 'first_name', __( 'First name', 'synthera-portal' ), $user->first_name );
		self::text_field( 'last_name', __( 'Last name', 'synthera-portal' ), $user->last_name );
		self::text_field( 'synp_company', __( 'Company', 'synthera-portal' ), get_user_meta( $user->ID, 'synp_company', true ) );
		self::text_field( 'synp_job_title', __( 'Job title', 'synthera-portal' ), get_user_meta( $user->ID, 'synp_job_title', true ) );
		self::text_field( 'synp_country', __( 'Country', 'synthera-portal' ), get_user_meta( $user->ID, 'synp_country', true ) );
		self::text_field( 'synp_phone', __( 'Phone', 'synthera-portal' ), get_user_meta( $user->ID, 'synp_phone', true ) );
		echo '<label>' . esc_html__( 'New password (leave blank to keep)', 'synthera-portal' ) . '<input type="password" name="new_password" autocomplete="new-password" /></label>';
		echo '<button type="submit">' . esc_html__( 'Save', 'synthera-portal' ) . '</button></form>';
	}

	protected static function view_support() {
		if ( isset( $_GET['synp_support'] ) && 'ok' === $_GET['synp_support'] ) {
			echo '<div class="synp-notice">' . esc_html__( 'Your message was sent.', 'synthera-portal' ) . '</div>';
		}
		echo '<h2>' . esc_html__( 'Support', 'synthera-portal' ) . '</h2>';
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="synp-form">';
		echo '<input type="hidden" name="action" value="synp_support" />';
		wp_nonce_field( 'synp_support', 'synp_support_nonce' );
		echo '<label>' . esc_html__( 'Topic', 'synthera-portal' ) . '<select name="category"><option>General</option><option>Product</option><option>Documents</option><option>Account</option></select></label>';
		echo '<label>' . esc_html__( 'Message', 'synthera-portal' ) . '<textarea name="message" rows="5" required></textarea></label>';
		echo '<button type="submit">' . esc_html__( 'Send', 'synthera-portal' ) . '</button></form>';
	}

	protected static function text_field( $name, $label, $value ) {
		echo '<label>' . esc_html( $label ) . '<input type="text" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '" /></label>';
	}

	/* ------- Handlers ------- */

	public static function handle_profile() {
		if ( ! is_user_logged_in() || ! isset( $_POST['synp_profile_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['synp_profile_nonce'] ), 'synp_update_profile' ) ) {
			wp_die( esc_html__( 'Invalid request.', 'synthera-portal' ), 400 );
		}
		$uid = get_current_user_id();
		wp_update_user( array(
			'ID'         => $uid,
			'first_name' => isset( $_POST['first_name'] ) ? sanitize_text_field( wp_unslash( $_POST['first_name'] ) ) : '',
			'last_name'  => isset( $_POST['last_name'] ) ? sanitize_text_field( wp_unslash( $_POST['last_name'] ) ) : '',
		) );
		foreach ( array( 'synp_company', 'synp_job_title', 'synp_country', 'synp_phone' ) as $meta ) {
			if ( isset( $_POST[ $meta ] ) ) {
				update_user_meta( $uid, $meta, sanitize_text_field( wp_unslash( $_POST[ $meta ] ) ) );
			}
		}
		if ( ! empty( $_POST['new_password'] ) ) {
			wp_set_password( wp_unslash( $_POST['new_password'] ), $uid );
		}
		wp_safe_redirect( add_query_arg( array( 'view' => 'profile', 'synp_profile' => 'ok' ), wp_get_referer() ) );
		exit;
	}

	public static function handle_support() {
		if ( ! is_user_logged_in() || ! isset( $_POST['synp_support_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['synp_support_nonce'] ), 'synp_support' ) ) {
			wp_die( esc_html__( 'Invalid request.', 'synthera-portal' ), 400 );
		}
		$user = wp_get_current_user();
		global $wpdb;
		$wpdb->insert(
			SYNP_Schema::table( 'contact' ),
			array(
				'name'       => $user->display_name,
				'email'      => $user->user_email,
				'category'   => isset( $_POST['category'] ) ? sanitize_text_field( wp_unslash( $_POST['category'] ) ) : 'General',
				'message'    => isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '',
				'user_id'    => $user->ID,
				'status'     => 'new',
				'created_at' => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%s', '%s', '%d', '%s', '%s' )
		);
		wp_safe_redirect( add_query_arg( array( 'view' => 'support', 'synp_support' => 'ok' ), wp_get_referer() ) );
		exit;
	}
}
