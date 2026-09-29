<?php
/**
 * Product Requests (Supabase: product_requests).
 *
 * A signed-in customer requests information about a product. They can read
 * their own requests; admins read/manage all and change status.
 *
 * Statuses mirror the app: pending, under_review, approved, completed, rejected.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Product_Requests {

	const STATUSES = array( 'pending', 'under_review', 'approved', 'completed', 'rejected' );

	public static function init() {
		add_action( 'admin_post_synp_product_request', array( __CLASS__, 'handle_submit' ) );
	}

	/** Customer submits a request (owner insert with status=pending). */
	public static function handle_submit() {
		if ( ! is_user_logged_in() ) {
			wp_die( esc_html__( 'Please sign in.', 'synthera-portal' ), 403 );
		}
		if ( ! isset( $_POST['synp_preq_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['synp_preq_nonce'] ), 'synp_product_request' ) ) {
			wp_die( esc_html__( 'Invalid request.', 'synthera-portal' ), 400 );
		}

		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		$message    = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';

		self::create( get_current_user_id(), $product_id, $message );

		$ref = wp_get_referer() ? wp_get_referer() : home_url( '/' );
		wp_safe_redirect( add_query_arg( 'synp_preq', 'ok', $ref ) );
		exit;
	}

	public static function create( $user_id, $product_id, $message ) {
		global $wpdb;
		$wpdb->insert(
			SYNP_Schema::table( 'product_requests' ),
			array(
				'user_id'    => (int) $user_id,
				'product_id' => $product_id ? (int) $product_id : null,
				'message'    => $message,
				'status'     => 'pending',
				'created_at' => current_time( 'mysql' ),
				'updated_at' => current_time( 'mysql' ),
			),
			array( '%d', '%d', '%s', '%s', '%s', '%s' )
		);
		return $wpdb->insert_id;
	}

	/** Requests belonging to a user (owner read). */
	public static function for_user( $user_id ) {
		global $wpdb;
		$table = SYNP_Schema::table( 'product_requests' );
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE user_id = %d ORDER BY created_at DESC", $user_id ) );
	}

	/** All requests (admin read). */
	public static function all() {
		global $wpdb;
		$table = SYNP_Schema::table( 'product_requests' );
		return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY created_at DESC" );
	}

	/** Admin changes status + optional note. */
	public static function set_status( $id, $status, $admin_note = null ) {
		global $wpdb;
		$status = SYNP_Helpers::sanitize_status( $status, self::STATUSES, 'pending' );
		$data   = array( 'status' => $status, 'updated_at' => current_time( 'mysql' ) );
		$fmt    = array( '%s', '%s' );
		if ( null !== $admin_note ) {
			$data['admin_note'] = sanitize_textarea_field( $admin_note );
			$fmt[]              = '%s';
		}
		$wpdb->update( SYNP_Schema::table( 'product_requests' ), $data, array( 'id' => (int) $id ), $fmt, array( '%d' ) );
	}
}
