<?php
/**
 * Admin management screens (Supabase: /admin/* routes, admin role only).
 *
 * Adds a top-level "Synthera Portal" menu in wp-admin with sub-pages:
 *   - Dashboard      (totals + recent activity)
 *   - Products       (managed via the syn_product CPT list — link)
 *   - Access Requests (approve / reject)
 *   - Product Requests (change status)
 *   - Inquiries      (contact submissions)
 *   - Resources      (managed via the syn_resource CPT list — link)
 *   - Settings       (map portal / login pages)
 *
 * All actions gated by SYNP_Helpers::require_admin() (Supabase: has_role admin).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Admin_Screens {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'handle_actions' ) );
		add_action( 'admin_init', array( __CLASS__, 'register_settings' ) );
	}

	public static function menu() {
		add_menu_page(
			__( 'Synthera Portal', 'synthera-portal' ),
			__( 'Synthera Portal', 'synthera-portal' ),
			'synp_manage_portal',
			'synthera-portal',
			array( __CLASS__, 'page_dashboard' ),
			'dashicons-heart',
			3
		);
		add_submenu_page( 'synthera-portal', __( 'Dashboard', 'synthera-portal' ), __( 'Dashboard', 'synthera-portal' ), 'synp_manage_portal', 'synthera-portal', array( __CLASS__, 'page_dashboard' ) );
		add_submenu_page( 'synthera-portal', __( 'Access Requests', 'synthera-portal' ), __( 'Access Requests', 'synthera-portal' ), 'synp_manage_portal', 'synp-access', array( __CLASS__, 'page_access' ) );
		add_submenu_page( 'synthera-portal', __( 'Product Requests', 'synthera-portal' ), __( 'Product Requests', 'synthera-portal' ), 'synp_manage_portal', 'synp-preq', array( __CLASS__, 'page_preq' ) );
		add_submenu_page( 'synthera-portal', __( 'Inquiries', 'synthera-portal' ), __( 'Inquiries', 'synthera-portal' ), 'synp_manage_portal', 'synp-inquiries', array( __CLASS__, 'page_inquiries' ) );
		add_submenu_page( 'synthera-portal', __( 'Settings', 'synthera-portal' ), __( 'Settings', 'synthera-portal' ), 'synp_manage_portal', 'synp-settings', array( __CLASS__, 'page_settings' ) );
	}

	/* ---------- Actions ---------- */

	public static function handle_actions() {
		if ( empty( $_GET['synp_action'] ) ) {
			return;
		}
		SYNP_Helpers::require_admin();
		$action = sanitize_key( $_GET['synp_action'] );
		$id     = isset( $_GET['id'] ) ? absint( $_GET['id'] ) : 0;

		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'synp_admin_' . $action . '_' . $id ) ) {
			wp_die( esc_html__( 'Security check failed.', 'synthera-portal' ), 403 );
		}

		switch ( $action ) {
			case 'access_approve':
				$res = SYNP_Access_Requests::approve( $id );
				$msg = is_wp_error( $res ) ? 'err' : 'approved';
				self::redirect( 'synp-access', $msg );
				break;
			case 'access_reject':
				SYNP_Access_Requests::reject( $id );
				self::redirect( 'synp-access', 'rejected' );
				break;
			case 'preq_status':
				$status = isset( $_GET['status'] ) ? sanitize_key( $_GET['status'] ) : 'pending';
				SYNP_Product_Requests::set_status( $id, $status );
				self::redirect( 'synp-preq', 'updated' );
				break;
		}
	}

	protected static function redirect( $page, $msg ) {
		wp_safe_redirect( admin_url( 'admin.php?page=' . $page . '&synp_msg=' . $msg ) );
		exit;
	}

	protected static function action_link( $action, $id, $label, $extra = array() ) {
		$args = array_merge( array( 'synp_action' => $action, 'id' => $id ), $extra );
		$url  = wp_nonce_url( add_query_arg( $args ), 'synp_admin_' . $action . '_' . $id );
		return '<a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>';
	}

	/* ---------- Pages ---------- */

	public static function page_dashboard() {
		SYNP_Helpers::require_admin();
		global $wpdb;
		$products = wp_count_posts( 'syn_product' );
		$access   = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . SYNP_Schema::table( 'access_requests' ) . " WHERE status='pending'" );
		$preq     = (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . SYNP_Schema::table( 'product_requests' ) . " WHERE status='pending'" );
		$customers = count_users();
		echo '<div class="wrap"><h1>' . esc_html__( 'Synthera Portal', 'synthera-portal' ) . '</h1>';
		echo '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-top:1rem">';
		self::stat( __( 'Active products', 'synthera-portal' ), isset( $products->publish ) ? $products->publish : 0 );
		self::stat( __( 'Pending access requests', 'synthera-portal' ), $access );
		self::stat( __( 'Pending product requests', 'synthera-portal' ), $preq );
		self::stat( __( 'Total users', 'synthera-portal' ), $customers['total_users'] );
		echo '</div>';
		echo '<p style="margin-top:1rem"><a class="button" href="' . esc_url( admin_url( 'edit.php?post_type=syn_product' ) ) . '">' . esc_html__( 'Manage Products', 'synthera-portal' ) . '</a> ';
		echo '<a class="button" href="' . esc_url( admin_url( 'edit.php?post_type=syn_resource' ) ) . '">' . esc_html__( 'Manage Resources', 'synthera-portal' ) . '</a></p></div>';
	}

	protected static function stat( $label, $value ) {
		echo '<div style="background:#fff;border:1px solid #ccd0d4;border-radius:8px;padding:1rem 1.25rem;min-width:180px"><div style="font-size:2rem;font-weight:700">' . esc_html( $value ) . '</div><div>' . esc_html( $label ) . '</div></div>';
	}

	public static function page_access() {
		SYNP_Helpers::require_admin();
		global $wpdb;
		$rows = $wpdb->get_results( 'SELECT * FROM ' . SYNP_Schema::table( 'access_requests' ) . ' ORDER BY created_at DESC LIMIT 200' );
		echo '<div class="wrap"><h1>' . esc_html__( 'Access Requests', 'synthera-portal' ) . '</h1>';
		self::notice();
		echo '<table class="wp-list-table widefat fixed striped"><thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
		foreach ( $rows as $r ) {
			echo '<tr><td>' . esc_html( $r->first_name . ' ' . $r->last_name ) . '</td><td>' . esc_html( $r->company ) . '</td><td>' . esc_html( $r->email ) . '</td><td>' . esc_html( wp_trim_words( $r->reason, 15 ) ) . '</td><td>' . esc_html( SYNP_Helpers::status_label( $r->status ) ) . '</td><td>';
			if ( 'pending' === $r->status ) {
				echo self::action_link( 'access_approve', $r->id, __( 'Approve', 'synthera-portal' ) ) . ' | ' . self::action_link( 'access_reject', $r->id, __( 'Reject', 'synthera-portal' ) );
			} else {
				echo '&mdash;';
			}
			echo '</td></tr>';
		}
		echo '</tbody></table></div>';
	}

	public static function page_preq() {
		SYNP_Helpers::require_admin();
		$rows = SYNP_Product_Requests::all();
		echo '<div class="wrap"><h1>' . esc_html__( 'Product Requests', 'synthera-portal' ) . '</h1>';
		self::notice();
		echo '<table class="wp-list-table widefat fixed striped"><thead><tr><th>User</th><th>Product</th><th>Message</th><th>Status</th><th>Set status</th></tr></thead><tbody>';
		foreach ( $rows as $r ) {
			$user    = get_userdata( $r->user_id );
			$product = $r->product_id ? get_the_title( $r->product_id ) : '—';
			echo '<tr><td>' . esc_html( $user ? $user->display_name : '#' . $r->user_id ) . '</td><td>' . esc_html( $product ) . '</td><td>' . esc_html( wp_trim_words( (string) $r->message, 15 ) ) . '</td><td>' . esc_html( SYNP_Helpers::status_label( $r->status ) ) . '</td><td>';
			foreach ( SYNP_Product_Requests::STATUSES as $s ) {
				if ( $s !== $r->status ) {
					echo self::action_link( 'preq_status', $r->id, SYNP_Helpers::status_label( $s ), array( 'status' => $s ) ) . ' ';
				}
			}
			echo '</td></tr>';
		}
		echo '</tbody></table></div>';
	}

	public static function page_inquiries() {
		SYNP_Helpers::require_admin();
		global $wpdb;
		$rows = $wpdb->get_results( 'SELECT * FROM ' . SYNP_Schema::table( 'contact' ) . ' ORDER BY created_at DESC LIMIT 200' );
		echo '<div class="wrap"><h1>' . esc_html__( 'Inquiries', 'synthera-portal' ) . '</h1>';
		echo '<table class="wp-list-table widefat fixed striped"><thead><tr><th>Name</th><th>Email</th><th>Category</th><th>Message</th><th>Date</th></tr></thead><tbody>';
		foreach ( $rows as $r ) {
			echo '<tr><td>' . esc_html( $r->name ) . '</td><td>' . esc_html( $r->email ) . '</td><td>' . esc_html( $r->category ) . '</td><td>' . esc_html( wp_trim_words( $r->message, 20 ) ) . '</td><td>' . esc_html( $r->created_at ) . '</td></tr>';
		}
		echo '</tbody></table></div>';
	}

	/* ---------- Settings ---------- */

	public static function register_settings() {
		register_setting( 'synp_settings', 'synp_portal_page', array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
		register_setting( 'synp_settings', 'synp_login_page', array( 'type' => 'integer', 'sanitize_callback' => 'absint' ) );
	}

	public static function page_settings() {
		SYNP_Helpers::require_admin();
		echo '<div class="wrap"><h1>' . esc_html__( 'Synthera Portal Settings', 'synthera-portal' ) . '</h1>';
		echo '<form method="post" action="options.php">';
		settings_fields( 'synp_settings' );
		echo '<table class="form-table">';
		echo '<tr><th>' . esc_html__( 'Portal page', 'synthera-portal' ) . '</th><td>';
		wp_dropdown_pages( array( 'name' => 'synp_portal_page', 'selected' => (int) get_option( 'synp_portal_page' ), 'show_option_none' => __( '— Select —', 'synthera-portal' ) ) );
		echo '<p class="description">' . esc_html__( 'The page containing [synthera_portal]. Used for login redirect + gating.', 'synthera-portal' ) . '</p></td></tr>';
		echo '<tr><th>' . esc_html__( 'Login page', 'synthera-portal' ) . '</th><td>';
		wp_dropdown_pages( array( 'name' => 'synp_login_page', 'selected' => (int) get_option( 'synp_login_page' ), 'show_option_none' => __( '— Select —', 'synthera-portal' ) ) );
		echo '<p class="description">' . esc_html__( 'The page containing [synthera_login].', 'synthera-portal' ) . '</p></td></tr>';
		echo '</table>';
		submit_button();
		echo '</form></div>';
	}

	protected static function notice() {
		if ( empty( $_GET['synp_msg'] ) ) {
			return;
		}
		$msg = sanitize_key( $_GET['synp_msg'] );
		$map = array(
			'approved' => __( 'Request approved and customer account created.', 'synthera-portal' ),
			'rejected' => __( 'Request rejected.', 'synthera-portal' ),
			'updated'  => __( 'Status updated.', 'synthera-portal' ),
			'err'      => __( 'Something went wrong.', 'synthera-portal' ),
		);
		if ( isset( $map[ $msg ] ) ) {
			$cls = 'err' === $msg ? 'notice-error' : 'notice-success';
			echo '<div class="notice ' . esc_attr( $cls ) . ' is-dismissible"><p>' . esc_html( $map[ $msg ] ) . '</p></div>';
		}
	}
}
