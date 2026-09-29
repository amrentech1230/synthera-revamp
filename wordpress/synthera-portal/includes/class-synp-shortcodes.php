<?php
/**
 * Shortcodes for use inside Elementor pages / WP pages.
 *
 *   [synthera_portal]            -> the full customer portal (gated).
 *   [synthera_request_access]    -> public Request Access form.
 *   [synthera_contact]           -> public Contact form.
 *   [synthera_resources]         -> list of published resources.
 *   [synthera_login]             -> styled login form (uses wp_login_form).
 *
 * Elementor note: drop a "Shortcode" widget onto the page and paste the tag.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Shortcodes {

	public static function init() {
		add_shortcode( 'synthera_portal', array( __CLASS__, 'portal' ) );
		add_shortcode( 'synthera_request_access', array( __CLASS__, 'request_access' ) );
		add_shortcode( 'synthera_contact', array( __CLASS__, 'contact' ) );
		add_shortcode( 'synthera_resources', array( __CLASS__, 'resources' ) );
		add_shortcode( 'synthera_login', array( __CLASS__, 'login' ) );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	public static function assets() {
		wp_register_style( 'synthera-portal', SYNP_URL . 'assets/portal.css', array(), SYNP_VERSION );
		wp_enqueue_style( 'synthera-portal' );
	}

	public static function portal() {
		return SYNP_Customer_Portal::render();
	}

	public static function login() {
		if ( is_user_logged_in() ) {
			$portal = SYNP_Helpers::page_url( 'synp_portal_page' );
			return '<p><a class="synp-btn" href="' . esc_url( $portal ? $portal : home_url( '/' ) ) . '">' . esc_html__( 'Go to portal', 'synthera-portal' ) . '</a></p>';
		}
		$redirect = SYNP_Helpers::page_url( 'synp_portal_page' );
		ob_start();
		echo '<div class="synp-auth"><h2>' . esc_html__( 'Welcome to Synthera', 'synthera-portal' ) . '</h2>';
		wp_login_form( array( 'redirect' => $redirect ? $redirect : home_url( '/' ) ) );
		echo '<p><a href="' . esc_url( wp_lostpassword_url() ) . '">' . esc_html__( 'Forgot password?', 'synthera-portal' ) . '</a></p></div>';
		return ob_get_clean();
	}

	public static function request_access() {
		ob_start();
		if ( isset( $_GET['synp_access'] ) && 'ok' === $_GET['synp_access'] ) {
			echo '<div class="synp-notice">' . esc_html__( 'Thank you — your request has been received. Our team will be in touch.', 'synthera-portal' ) . '</div>';
			return ob_get_clean();
		}
		if ( isset( $_GET['synp_access'] ) && 'error' === $_GET['synp_access'] ) {
			echo '<div class="synp-error">' . esc_html__( 'Please check the form and try again.', 'synthera-portal' ) . '</div>';
		}
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="synp-form">';
		echo '<input type="hidden" name="action" value="synp_access_request" />';
		wp_nonce_field( 'synp_access_request', 'synp_access_nonce' );
		self::field( 'first_name', __( 'First name', 'synthera-portal' ), true );
		self::field( 'last_name', __( 'Last name', 'synthera-portal' ), true );
		self::field( 'company', __( 'Company', 'synthera-portal' ), true );
		self::field( 'job_title', __( 'Job title', 'synthera-portal' ) );
		self::field( 'email', __( 'Email', 'synthera-portal' ), true, 'email' );
		self::field( 'phone', __( 'Phone', 'synthera-portal' ) );
		self::field( 'country', __( 'Country', 'synthera-portal' ) );
		echo '<label>' . esc_html__( 'Reason for access', 'synthera-portal' ) . '<textarea name="reason" rows="3" required></textarea></label>';
		echo '<label>' . esc_html__( 'Additional message', 'synthera-portal' ) . '<textarea name="message" rows="3"></textarea></label>';
		echo '<button type="submit">' . esc_html__( 'Request Access', 'synthera-portal' ) . '</button></form>';
		return ob_get_clean();
	}

	public static function contact() {
		ob_start();
		if ( isset( $_GET['synp_contact'] ) && 'ok' === $_GET['synp_contact'] ) {
			echo '<div class="synp-notice">' . esc_html__( 'Thank you for contacting us.', 'synthera-portal' ) . '</div>';
			return ob_get_clean();
		}
		echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="synp-form">';
		echo '<input type="hidden" name="action" value="synp_contact_submit" />';
		wp_nonce_field( 'synp_contact_submit', 'synp_contact_nonce' );
		self::field( 'name', __( 'Name', 'synthera-portal' ), true );
		self::field( 'email', __( 'Email', 'synthera-portal' ), true, 'email' );
		self::field( 'organization', __( 'Organization', 'synthera-portal' ) );
		self::field( 'phone', __( 'Phone', 'synthera-portal' ) );
		echo '<label>' . esc_html__( 'Inquiry type', 'synthera-portal' ) . '<select name="category"><option>General</option><option>Partnership</option><option>Scientific</option><option>Media</option></select></label>';
		echo '<label>' . esc_html__( 'Message', 'synthera-portal' ) . '<textarea name="message" rows="5" required></textarea></label>';
		echo '<button type="submit">' . esc_html__( 'Send message', 'synthera-portal' ) . '</button></form>';
		return ob_get_clean();
	}

	public static function resources( $atts ) {
		$atts = shortcode_atts( array( 'count' => 12 ), $atts );
		$q    = new WP_Query( array( 'post_type' => 'syn_resource', 'posts_per_page' => (int) $atts['count'], 'post_status' => 'publish' ) );
		ob_start();
		echo '<div class="synp-resource-grid">';
		while ( $q->have_posts() ) {
			$q->the_post();
			echo '<a class="synp-resource-card" href="' . esc_url( get_permalink() ) . '">';
			if ( has_post_thumbnail() ) {
				echo get_the_post_thumbnail( get_the_ID(), 'medium' );
			}
			echo '<h4>' . esc_html( get_the_title() ) . '</h4><p>' . esc_html( get_the_excerpt() ) . '</p></a>';
		}
		wp_reset_postdata();
		echo '</div>';
		return ob_get_clean();
	}

	protected static function field( $name, $label, $required = false, $type = 'text' ) {
		echo '<label>' . esc_html( $label ) . '<input type="' . esc_attr( $type ) . '" name="' . esc_attr( $name ) . '"' . ( $required ? ' required' : '' ) . ' /></label>';
	}
}

/**
 * Public contact form handler (Supabase: contact_submissions public insert).
 */
add_action( 'admin_post_nopriv_synp_contact_submit', 'synp_handle_contact' );
add_action( 'admin_post_synp_contact_submit', 'synp_handle_contact' );
function synp_handle_contact() {
	if ( ! isset( $_POST['synp_contact_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['synp_contact_nonce'] ), 'synp_contact_submit' ) ) {
		wp_die( esc_html__( 'Invalid request.', 'synthera-portal' ), 400 );
	}
	$name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';
	if ( '' === $name || ! is_email( $email ) || '' === $message ) {
		wp_safe_redirect( add_query_arg( 'synp_contact', 'error', wp_get_referer() ) );
		exit;
	}
	global $wpdb;
	$wpdb->insert(
		SYNP_Schema::table( 'contact' ),
		array(
			'name'         => $name,
			'email'        => $email,
			'organization' => isset( $_POST['organization'] ) ? sanitize_text_field( wp_unslash( $_POST['organization'] ) ) : '',
			'phone'        => isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '',
			'category'     => isset( $_POST['category'] ) ? sanitize_text_field( wp_unslash( $_POST['category'] ) ) : 'General',
			'message'      => $message,
			'status'       => 'new',
			'created_at'   => current_time( 'mysql' ),
		),
		array( '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s' )
	);
	wp_safe_redirect( add_query_arg( 'synp_contact', 'ok', wp_get_referer() ) );
	exit;
}
