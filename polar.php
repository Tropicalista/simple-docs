<?php
/**
 * Plugin Name: POLAR WP
 * Text Domain: polar
 */
defined( 'ABSPATH' ) || exit;

require_once plugin_dir_path( __FILE__ ) . 'build/build.php';
require_once __DIR__ . '/includes/register.php';

add_action(
	'admin_menu',
	function () {
		add_submenu_page(
			'options-general.php',
			__( 'Polar WP', 'polar' ),
			__( 'Polar WP', 'polar' ),
			'manage_options',
			'polar-wp-admin',
			'polar_polar_wp_admin_render_page'
		);
	}
);