<?php
/**
 * Roles & capabilities.
 *
 * Mirrors the Supabase `app_role` enum ('admin','customer') and the
 * user_roles table. In WordPress:
 *   - 'admin'    -> the built-in `administrator` role (manage_options).
 *   - 'customer' -> a custom `syn_customer` role that can access the portal
 *                   but nothing in wp-admin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class SYNP_Roles {

	/**
	 * Create custom roles. Called on activation.
	 */
	public static function add_roles() {
		add_role(
			SYNP_CUSTOMER_ROLE,
			__( 'Synthera Customer', 'synthera-portal' ),
			array(
				'read'                 => true, // required to have a profile
				'synp_access_portal'   => true, // gate for /customer/*
			)
		);

		// Give administrators the portal + management caps too.
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			$admin->add_cap( 'synp_access_portal' );
			$admin->add_cap( 'synp_manage_portal' );
		}
	}

	/**
	 * Remove roles/caps. (Only call from an uninstall routine, not deactivation.)
	 */
	public static function remove_roles() {
		remove_role( SYNP_CUSTOMER_ROLE );
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			$admin->remove_cap( 'synp_access_portal' );
			$admin->remove_cap( 'synp_manage_portal' );
		}
	}
}
