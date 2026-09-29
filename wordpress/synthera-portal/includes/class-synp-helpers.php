<?php
/**
 * Shared helpers — the WordPress equivalent of Supabase RLS checks.
 *
 * In Supabase, has_role(auth.uid(),'admin') guarded every privileged read/write.
 * Here we centralise the equivalent capability checks.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Helpers {

	/** Is the current user an admin (Supabase: has_role 'admin')? */
	public static function is_admin_user() {
		return current_user_can( 'synp_manage_portal' ) || current_user_can( 'manage_options' );
	}

	/** May the current user access the customer portal? */
	public static function can_access_portal() {
		return is_user_logged_in() && current_user_can( 'synp_access_portal' );
	}

	/** Require portal access or redirect to login (Supabase: _authenticated gate). */
	public static function require_portal_or_redirect() {
		if ( self::can_access_portal() ) {
			return;
		}
		$login = self::page_url( 'synp_login_page' );
		if ( ! $login ) {
			$login = wp_login_url( home_url( add_query_arg( array() ) ) );
		}
		wp_safe_redirect( $login );
		exit;
	}

	/** Require admin or 403. */
	public static function require_admin() {
		if ( ! self::is_admin_user() ) {
			wp_die( esc_html__( 'You do not have permission to view this page.', 'synthera-portal' ), 403 );
		}
	}

	/**
	 * Resolve a configured page URL by option key.
	 * Admins map the portal pages in Settings -> Synthera Portal.
	 */
	public static function page_url( $option_key ) {
		$page_id = (int) get_option( $option_key, 0 );
		return $page_id ? get_permalink( $page_id ) : '';
	}

	/** Sanitize a status against an allowed list. */
	public static function sanitize_status( $value, array $allowed, $default ) {
		$value = sanitize_key( $value );
		return in_array( $value, $allowed, true ) ? $value : $default;
	}

	/** Human label for a status key. */
	public static function status_label( $key ) {
		$map = array(
			'pending'      => __( 'Pending', 'synthera-portal' ),
			'under_review' => __( 'Under Review', 'synthera-portal' ),
			'approved'     => __( 'Approved', 'synthera-portal' ),
			'completed'    => __( 'Completed', 'synthera-portal' ),
			'rejected'     => __( 'Rejected', 'synthera-portal' ),
			'new'          => __( 'New', 'synthera-portal' ),
		);
		return isset( $map[ $key ] ) ? $map[ $key ] : ucfirst( str_replace( '_', ' ', $key ) );
	}
}
