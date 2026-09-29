<?php
/**
 * Product Documents (Supabase: product_documents + private storage bucket).
 *
 * Files are stored OUTSIDE the web-accessible media library, in
 * wp-content/uploads/synthera-private/, protected by an .htaccess deny rule.
 * Signed-in customers download through a gated endpoint that streams the file
 * — the equivalent of Supabase signed URLs for a private bucket.
 *
 * Download URL:  ?synp_doc=<document_id>&_wpnonce=<nonce>
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Documents {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'maybe_stream' ) );
	}

	public static function private_dir() {
		$uploads = wp_upload_dir();
		return trailingslashit( $uploads['basedir'] ) . 'synthera-private';
	}

	/** Create the private dir and block direct web access. */
	public static function ensure_private_dir() {
		$dir = self::private_dir();
		if ( ! file_exists( $dir ) ) {
			wp_mkdir_p( $dir );
		}
		// Deny direct access (Apache). Nginx users: block the folder in server config.
		$htaccess = trailingslashit( $dir ) . '.htaccess';
		if ( ! file_exists( $htaccess ) ) {
			file_put_contents( $htaccess, "Require all denied\n<IfModule !mod_authz_core.c>\nOrder allow,deny\nDeny from all\n</IfModule>\n" );
		}
		$index = trailingslashit( $dir ) . 'index.html';
		if ( ! file_exists( $index ) ) {
			file_put_contents( $index, '' );
		}
	}

	public static function add( $product_id, $title, $doc_type, $file_path ) {
		global $wpdb;
		$wpdb->insert(
			SYNP_Schema::table( 'product_documents' ),
			array(
				'product_id' => (int) $product_id,
				'title'      => sanitize_text_field( $title ),
				'doc_type'   => sanitize_text_field( $doc_type ),
				'file_path'  => sanitize_text_field( $file_path ),
				'created_at' => current_time( 'mysql' ),
			),
			array( '%d', '%s', '%s', '%s', '%s' )
		);
		return $wpdb->insert_id;
	}

	public static function for_product( $product_id ) {
		global $wpdb;
		$table = SYNP_Schema::table( 'product_documents' );
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table} WHERE product_id = %d ORDER BY created_at DESC", $product_id ) );
	}

	/** Build a nonce-signed download link for a signed-in customer. */
	public static function download_url( $doc_id ) {
		return wp_nonce_url( add_query_arg( 'synp_doc', (int) $doc_id, home_url( '/' ) ), 'synp_doc_' . (int) $doc_id );
	}

	/** Stream a document if the request is authenticated and valid. */
	public static function maybe_stream() {
		if ( empty( $_GET['synp_doc'] ) ) {
			return;
		}
		$doc_id = absint( $_GET['synp_doc'] );

		if ( ! SYNP_Helpers::can_access_portal() ) {
			SYNP_Helpers::require_portal_or_redirect();
		}
		if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'synp_doc_' . $doc_id ) ) {
			wp_die( esc_html__( 'This download link has expired.', 'synthera-portal' ), 403 );
		}

		global $wpdb;
		$table = SYNP_Schema::table( 'product_documents' );
		$doc   = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $doc_id ) );
		if ( ! $doc ) {
			wp_die( esc_html__( 'Document not found.', 'synthera-portal' ), 404 );
		}

		// Resolve within the private dir; block traversal.
		$base = self::private_dir();
		$path = realpath( trailingslashit( $base ) . ltrim( $doc->file_path, '/' ) );
		if ( ! $path || strpos( $path, realpath( $base ) ) !== 0 || ! is_file( $path ) ) {
			wp_die( esc_html__( 'File unavailable.', 'synthera-portal' ), 404 );
		}

		$filetype = wp_check_filetype( $path );
		nocache_headers();
		header( 'Content-Type: ' . ( $filetype['type'] ? $filetype['type'] : 'application/octet-stream' ) );
		header( 'Content-Disposition: attachment; filename="' . basename( $path ) . '"' );
		header( 'Content-Length: ' . filesize( $path ) );
		readfile( $path );
		exit;
	}
}
