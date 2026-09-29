<?php
/**
 * Custom tables — the WordPress equivalent of the Supabase tables that don't
 * map cleanly to posts:
 *   - syn_access_requests   (Supabase: access_requests)
 *   - syn_product_requests  (Supabase: product_requests)
 *   - syn_product_documents (Supabase: product_documents)
 *   - syn_contact           (Supabase: contact_submissions)
 *
 * Products, categories and resources use CPTs/taxonomies instead (see
 * class-synp-post-types.php).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Schema {

	public static function table( $name ) {
		global $wpdb;
		return $wpdb->prefix . 'syn_' . $name;
	}

	/**
	 * Create/upgrade tables using dbDelta.
	 */
	public static function install() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$charset = $wpdb->get_charset_collate();

		$access   = self::table( 'access_requests' );
		$preq     = self::table( 'product_requests' );
		$docs     = self::table( 'product_documents' );
		$contact  = self::table( 'contact' );

		$sql = array();

		// access_requests
		$sql[] = "CREATE TABLE {$access} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			first_name VARCHAR(120) NOT NULL,
			last_name VARCHAR(120) NOT NULL,
			company VARCHAR(200) NOT NULL,
			job_title VARCHAR(200) NULL,
			email VARCHAR(255) NOT NULL,
			phone VARCHAR(60) NULL,
			country VARCHAR(120) NULL,
			reason TEXT NOT NULL,
			message TEXT NULL,
			status VARCHAR(30) NOT NULL DEFAULT 'pending',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY status_idx (status),
			KEY email_idx (email)
		) {$charset};";

		// product_requests
		$sql[] = "CREATE TABLE {$preq} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			user_id BIGINT UNSIGNED NOT NULL,
			product_id BIGINT UNSIGNED NULL,
			message TEXT NULL,
			status VARCHAR(30) NOT NULL DEFAULT 'pending',
			admin_note TEXT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_idx (user_id),
			KEY product_idx (product_id),
			KEY status_idx (status)
		) {$charset};";

		// product_documents (files live in the private uploads dir)
		$sql[] = "CREATE TABLE {$docs} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			product_id BIGINT UNSIGNED NOT NULL,
			title VARCHAR(255) NOT NULL,
			doc_type VARCHAR(120) NOT NULL DEFAULT 'Product Information',
			file_path VARCHAR(255) NOT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY product_idx (product_id)
		) {$charset};";

		// contact submissions
		$sql[] = "CREATE TABLE {$contact} (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(200) NOT NULL,
			email VARCHAR(255) NOT NULL,
			organization VARCHAR(200) NULL,
			phone VARCHAR(60) NULL,
			subject VARCHAR(255) NULL,
			category VARCHAR(120) NULL,
			message TEXT NOT NULL,
			user_id BIGINT UNSIGNED NULL,
			status VARCHAR(30) NOT NULL DEFAULT 'new',
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY status_idx (status)
		) {$charset};";

		foreach ( $sql as $statement ) {
			dbDelta( $statement );
		}

		update_option( 'synp_db_version', SYNP_VERSION );
	}
}
