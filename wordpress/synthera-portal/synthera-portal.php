<?php
/**
 * Plugin Name:       Synthera Portal
 * Plugin URI:        https://github.com/amrentech1230/synthera-revamp
 * Description:        Reproduces the Synthera React/Supabase app in WordPress: customer & admin portals, roles, products, access requests, product requests, private documents, and resources. Public pages are built with Elementor; this plugin supplies the application logic.
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.0
 * Author:            Synthera
 * License:           GPL-2.0-or-later
 * Text Domain:       synthera-portal
 *
 * ---------------------------------------------------------------------------
 * ARCHITECTURE NOTE
 * ---------------------------------------------------------------------------
 * The original app (synthera-revamp) is React 19 + TanStack Start + Supabase
 * (Postgres, Auth, RLS, Storage). WordPress cannot "import" that stack, so this
 * plugin re-implements the SAME feature set on WordPress primitives:
 *
 *   Supabase concept            ->  WordPress implementation
 *   ------------------------------------------------------------------
 *   auth.users                  ->  wp_users
 *   user_roles (admin/customer) ->  WP roles: administrator + syn_customer
 *   has_role(uid,'admin')       ->  current_user_can('manage_options')
 *   profiles                    ->  user meta (syn_*)
 *   products / categories       ->  CPT `syn_product` + taxonomy `syn_area`
 *   resources                   ->  CPT `syn_resource`
 *   access_requests             ->  custom table {prefix}syn_access_requests
 *   product_requests            ->  custom table {prefix}syn_product_requests
 *   product_documents           ->  custom table {prefix}syn_product_documents
 *   Storage private bucket      ->  wp-content/uploads/synthera-private + gated download endpoint
 *   Row Level Security          ->  capability checks in PHP (see helpers below)
 *
 * Public marketing pages (Home, About, Science, Therapeutic Areas, Quality,
 * Resources, Contact, Request Access, policies) are built in Elementor.
 * See wordpress/ELEMENTOR-GUIDE.md.
 * ---------------------------------------------------------------------------
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'SYNP_VERSION', '1.0.0' );
define( 'SYNP_FILE', __FILE__ );
define( 'SYNP_DIR', plugin_dir_path( __FILE__ ) );
define( 'SYNP_URL', plugin_dir_url( __FILE__ ) );
define( 'SYNP_CUSTOMER_ROLE', 'syn_customer' );

/**
 * Autoload includes.
 */
require_once SYNP_DIR . 'includes/class-synp-roles.php';
require_once SYNP_DIR . 'includes/class-synp-schema.php';
require_once SYNP_DIR . 'includes/class-synp-post-types.php';
require_once SYNP_DIR . 'includes/class-synp-helpers.php';
require_once SYNP_DIR . 'includes/class-synp-access-requests.php';
require_once SYNP_DIR . 'includes/class-synp-product-requests.php';
require_once SYNP_DIR . 'includes/class-synp-documents.php';
require_once SYNP_DIR . 'includes/class-synp-customer-portal.php';
require_once SYNP_DIR . 'includes/class-synp-admin-screens.php';
require_once SYNP_DIR . 'includes/class-synp-shortcodes.php';
require_once SYNP_DIR . 'includes/class-synp-migrate-cli.php';

/**
 * Activation: create roles, custom tables, private upload dir, and flush rewrites.
 */
function synp_activate() {
	SYNP_Roles::add_roles();
	SYNP_Post_Types::register(); // so rewrite rules exist before flush
	SYNP_Schema::install();
	SYNP_Documents::ensure_private_dir();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'synp_activate' );

/**
 * Deactivation: flush rewrites (keep data and roles for safety).
 */
function synp_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'synp_deactivate' );

/**
 * Boot the plugin.
 */
function synp_boot() {
	SYNP_Post_Types::init();
	SYNP_Access_Requests::init();
	SYNP_Product_Requests::init();
	SYNP_Documents::init();
	SYNP_Customer_Portal::init();
	SYNP_Admin_Screens::init();
	SYNP_Shortcodes::init();

	load_plugin_textdomain( 'synthera-portal', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'synp_boot' );
