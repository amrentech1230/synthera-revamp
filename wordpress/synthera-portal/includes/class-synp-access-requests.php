<?php
/**
 * Access Requests (Supabase: access_requests).
 *
 * Anyone (logged-out included) may submit a request from the public
 * "Request Access" page. Only admins can read/approve/reject.
 *
 * Front-end submission is handled via admin-post.php so it works from an
 * Elementor page containing the [synthera_request_access] shortcode.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Access_Requests {

	public static function init() {
		add_action( 'admin_post_nopriv_synp_access_request', array( __CLASS__, 'handle_submit' ) );
		add_action( 'admin_post_synp_access_request', array( __CLASS__, 'handle_submit' ) );
	}

	public static function handle_submit() {
		if ( ! isset( $_POST['synp_access_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['synp_access_nonce'] ), 'synp_access_request' ) ) {
			self::redirect_back( 'error' );
		}

		$email  = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
		$reason = isset( $_POST['reason'] ) ? sanitize_textarea_field( wp_unslash( $_POST['reason'] ) ) : '';

		// Mirror the Supabase check: valid email length and reason <= 2000.
		if ( ! is_email( $email ) || '' === $reason || strlen( $reason ) > 2000 ) {
			self::redirect_back( 'error' );
		}

		global $wpdb;
		$table = SYNP_Schema::table( 'access_requests' );
		$wpdb->insert(
			$table,
			array(
				'first_name' => self::field( 'first_name', 120 ),
				'last_name'  => self::field( 'last_name', 120 ),
				'company'    => self::field( 'company', 200 ),
				'job_title'  => self::field( 'job_title', 200 ),
				'email'      => $email,
				'phone'      => self::field( 'phone', 60 ),
				'country'    => self::field( 'country', 120 ),
				'reason'     => $reason,
				'message'    => isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '',
				'status'     => 'pending',
				'created_at' => current_time( 'mysql' ),
			),
			array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
		);

		/**
		 * Fire so admins can hook email notifications.
		 */
		do_action( 'synp_access_request_created', $wpdb->insert_id, $email );

		self::redirect_back( 'ok' );
	}

	protected static function field( $key, $max ) {
		$v = isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';
		return mb_substr( $v, 0, $max );
	}

	protected static function redirect_back( $state ) {
		$ref = wp_get_referer() ? wp_get_referer() : home_url( '/' );
		wp_safe_redirect( add_query_arg( 'synp_access', $state, $ref ) );
		exit;
	}

	/** Approve a request: create the WP customer account and mark approved. */
	public static function approve( $id ) {
		global $wpdb;
		$table = SYNP_Schema::table( 'access_requests' );
		$row   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id ) );
		if ( ! $row ) {
			return new WP_Error( 'not_found', __( 'Request not found.', 'synthera-portal' ) );
		}

		$user_id = email_exists( $row->email );
		if ( ! $user_id ) {
			$password = wp_generate_password( 16 );
			$user_id  = wp_insert_user(
				array(
					'user_login'   => $row->email,
					'user_email'   => $row->email,
					'user_pass'    => $password,
					'first_name'   => $row->first_name,
					'last_name'    => $row->last_name,
					'role'         => SYNP_CUSTOMER_ROLE,
					'display_name' => trim( $row->first_name . ' ' . $row->last_name ),
				)
			);
			if ( is_wp_error( $user_id ) ) {
				return $user_id;
			}
			update_user_meta( $user_id, 'synp_company', $row->company );
			update_user_meta( $user_id, 'synp_job_title', $row->job_title );
			update_user_meta( $user_id, 'synp_country', $row->country );
			update_user_meta( $user_id, 'synp_phone', $row->phone );

			// Let the new customer set their password.
			wp_new_user_notification( $user_id, null, 'user' );
		}

		$wpdb->update( $table, array( 'status' => 'approved' ), array( 'id' => $id ), array( '%s' ), array( '%d' ) );
		return $user_id;
	}

	public static function reject( $id ) {
		global $wpdb;
		$table = SYNP_Schema::table( 'access_requests' );
		$wpdb->update( $table, array( 'status' => 'rejected' ), array( 'id' => (int) $id ), array( '%s' ), array( '%d' ) );
	}
}
