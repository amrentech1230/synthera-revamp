<?php
/**
 * Custom post types & taxonomies.
 *
 *   syn_product   (Supabase: products)   — signed-in read only
 *   syn_resource  (Supabase: resources)  — public read when published
 *   syn_area      taxonomy               — therapeutic areas (Supabase: categories)
 *
 * Product meta reproduces the extra Supabase columns:
 *   sku, product_type, status, availability, short_desc, long_desc,
 *   scientific_info, therapeutic_info, benefits[], featured, badge.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Post_Types {

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ) );
		add_action( 'add_meta_boxes', array( __CLASS__, 'meta_boxes' ) );
		add_action( 'save_post_syn_product', array( __CLASS__, 'save_product_meta' ) );
		// Products are gated: never expose single/archive to logged-out visitors.
		add_action( 'template_redirect', array( __CLASS__, 'gate_product_singles' ) );
	}

	public static function register() {
		register_post_type(
			'syn_product',
			array(
				'label'        => __( 'Products', 'synthera-portal' ),
				'public'       => false,          // not publicly queryable
				'show_ui'      => true,           // manage in wp-admin
				'show_in_menu' => 'synthera-portal',
				'show_in_rest' => true,
				'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
				'rewrite'      => array( 'slug' => 'catalog' ),
				'has_archive'  => false,
				'menu_icon'    => 'dashicons-products',
			)
		);

		register_post_type(
			'syn_resource',
			array(
				'label'        => __( 'Resources', 'synthera-portal' ),
				'public'       => true,           // public read when published
				'show_in_rest' => true,
				'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
				'rewrite'      => array( 'slug' => 'resources' ),
				'has_archive'  => true,
				'menu_icon'    => 'dashicons-media-document',
			)
		);

		register_taxonomy(
			'syn_area',
			array( 'syn_product', 'syn_resource' ),
			array(
				'label'        => __( 'Therapeutic Areas', 'synthera-portal' ),
				'public'       => true,
				'hierarchical' => true,
				'show_in_rest' => true,
				'rewrite'      => array( 'slug' => 'therapeutic-area' ),
			)
		);
	}

	/** Products require sign-in even if a URL is guessed. */
	public static function gate_product_singles() {
		if ( is_singular( 'syn_product' ) && ! SYNP_Helpers::can_access_portal() ) {
			SYNP_Helpers::require_portal_or_redirect();
		}
	}

	public static function meta_boxes() {
		add_meta_box(
			'synp_product_fields',
			__( 'Product Details', 'synthera-portal' ),
			array( __CLASS__, 'render_product_meta' ),
			'syn_product',
			'normal',
			'high'
		);
	}

	public static function render_product_meta( $post ) {
		wp_nonce_field( 'synp_save_product', 'synp_product_nonce' );
		$fields = self::product_field_defs();
		echo '<table class="form-table">';
		foreach ( $fields as $key => $def ) {
			$value = get_post_meta( $post->ID, $key, true );
			echo '<tr><th><label for="' . esc_attr( $key ) . '">' . esc_html( $def['label'] ) . '</label></th><td>';
			if ( 'textarea' === $def['type'] ) {
				echo '<textarea style="width:100%" rows="3" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '">' . esc_textarea( $value ) . '</textarea>';
			} elseif ( 'select' === $def['type'] ) {
				echo '<select id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '">';
				foreach ( $def['options'] as $opt ) {
					echo '<option value="' . esc_attr( $opt ) . '" ' . selected( $value, $opt, false ) . '>' . esc_html( $opt ) . '</option>';
				}
				echo '</select>';
			} else {
				echo '<input type="text" style="width:100%" id="' . esc_attr( $key ) . '" name="' . esc_attr( $key ) . '" value="' . esc_attr( $value ) . '" />';
			}
			echo '</td></tr>';
		}
		echo '</table>';
	}

	protected static function product_field_defs() {
		return array(
			'synp_sku'              => array( 'label' => __( 'SKU', 'synthera-portal' ), 'type' => 'text' ),
			'synp_product_type'     => array( 'label' => __( 'Product Type', 'synthera-portal' ), 'type' => 'text' ),
			'synp_status'           => array( 'label' => __( 'Status', 'synthera-portal' ), 'type' => 'select', 'options' => array( 'active', 'draft', 'archived' ) ),
			'synp_availability'     => array( 'label' => __( 'Availability', 'synthera-portal' ), 'type' => 'text' ),
			'synp_short_desc'       => array( 'label' => __( 'Short Description', 'synthera-portal' ), 'type' => 'textarea' ),
			'synp_scientific_info'  => array( 'label' => __( 'Scientific Info', 'synthera-portal' ), 'type' => 'textarea' ),
			'synp_therapeutic_info' => array( 'label' => __( 'Therapeutic Info', 'synthera-portal' ), 'type' => 'textarea' ),
			'synp_badge'            => array( 'label' => __( 'Badge', 'synthera-portal' ), 'type' => 'text' ),
			'synp_featured'         => array( 'label' => __( 'Featured (1/0)', 'synthera-portal' ), 'type' => 'text' ),
		);
	}

	public static function save_product_meta( $post_id ) {
		if ( ! isset( $_POST['synp_product_nonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['synp_product_nonce'] ), 'synp_save_product' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		foreach ( array_keys( self::product_field_defs() ) as $key ) {
			if ( isset( $_POST[ $key ] ) ) {
				$raw = wp_unslash( $_POST[ $key ] );
				update_post_meta( $post_id, $key, sanitize_textarea_field( $raw ) );
			}
		}
	}
}
