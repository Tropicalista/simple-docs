<?php
/**
 * Register custom post type.
 *
 * @package simple-docs
 * @since   1.0.0
 */

namespace SimpleDocs;

// don't call the file directly.
defined( 'ABSPATH' ) || exit;

/**
 * Register 'article' post type.
 *
 * Register the main 'article' (actual slug is 'SimpleDocs_knowledgebase' post type that the plugin uses.
 *
 * @since 1.0
 */
function register_docs() {

	$labels = array(
		'name'               => __( 'Knowledgebase', 'simple-docs' ),
		'singular_name'      => __( 'Knowledgebase', 'simple-docs' ),
		'all_items'          => __( 'Docs', 'simple-docs' ),
		'add_new'            => __( 'New Doc', 'simple-docs' ),
		'add_new_item'       => __( 'Add New Doc', 'simple-docs' ),
		'edit_item'          => __( 'Edit Doc', 'simple-docs' ),
		'new_item'           => __( 'New Doc', 'simple-docs' ),
		'view_item'          => __( 'View Doc', 'simple-docs' ),
		'search_items'       => __( 'Search Docs', 'simple-docs' ),
		'not_found'          => __( 'Nothing found', 'simple-docs' ),
		'not_found_in_trash' => __( 'Nothing found in Trash', 'simple-docs' ),
		'parent_item_colon'  => '',
	);

	$rewrite = array(
		'slug'       => get_option( 'SimpleDocs_prefix', 'docs' ),
		'with_front' => false,
		'feeds'      => false,
	);

	$args = array(
		'labels'              => $labels,
		'public'              => true,
		'publicly_queryable'  => true,
		'show_ui'             => true,
		'query_var'           => true,
		'menu_icon'           => 'dashicons-book',
		'capability_type'     => 'post',
		'hierarchical'        => true,
		'supports'            => array(
			'title',
			'editor',
			'thumbnail',
			'comments',
			'tags',
			'revisions',
			'author',
			'excerpt',
			'page-attributes',
			'custom-fields',
		),
		'rewrite'             => $rewrite,
		'show_in_menu'        => true,
		'show_in_nav_menus'   => true,
		'show_in_admin_bar'   => true,
		'show_in_rest'        => true,
		'can_export'          => true,
		'has_archive'         => true,
		'exclude_from_search' => true,
	);

	/**
	 * Filter the arguments for the 'SimpleDocs_knowledgebase' post type
	 *
	 * @param array  $args
	 * @param string $post_type
	 */
	$args = apply_filters( 'simple_docs_register_post_type_args', $args, 'docs' );

	// Register the post type.
	register_post_type( 'doc', $args );

	register_meta(
		'post',
		'feedback',
		array(
			'object_subtype' => 'doc',
			'type'           => 'integer',
			'default'        => 0,
			'single'         => true,
			'show_in_rest'   => true,
			'auth_callback'  => '__return_true',
		)
	);
}

/**
 * Register KB taxonomies.
 *
 * Register the 'category' taxonomy for the Docs post type.
 *
 * @since 1.0.0
 */
function register_doc_category() {

	// Add new taxonomy, make it hierarchical (like categories).
	$labels = array(
		'name'              => __( 'Knowledgebase Categories', 'simple-docs' ),
		'singular_name'     => __( 'Knowledgebase Category', 'simple-docs' ),
		'search_items'      => __( 'Search Knowledgebase Category', 'simple-docs' ),
		'all_items'         => __( 'All Knowledgebase Categories', 'simple-docs' ),
		'parent_item'       => __( 'Parent Knowledgebase Category', 'simple-docs' ),
		'parent_item_colon' => __( 'Parent Knowledgebase Category:', 'simple-docs' ),
		'edit_item'         => __( 'Edit Knowledgebase Category', 'simple-docs' ),
		'update_item'       => __( 'Update Knowledgebase Category', 'simple-docs' ),
		'add_new_item'      => __( 'Add New Knowledgebase Category', 'simple-docs' ),
		'new_item_name'     => __( 'New Knowledgebase Category Name', 'simple-docs' ),
		'menu_name'         => __( 'Categories', 'simple-docs' ),
	);

	$rewrite = array(
		'slug'       => get_option( 'SimpleDocs_cat_prefix', 'doc-category' ),
		'with_front' => false,
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'singular_label'    => __( 'Knowledgebase Category', 'simple-docs' ),
		'show_admin_column' => true,
		'show_ui'           => true,
		'show_in_rest'      => true,
		'query_var'         => true,
		'has_archive'       => true,
		'rewrite'           => $rewrite,
	);

	/**
	 * Filter the arguments for the 'SimpleDocs_taxonomy' taxonomy
	 *
	 * @param array  $args
	 * @param string $taxonomy
	 */
	$args = apply_filters( 'simple_docs_register_taxonomy_args', $args, 'SimpleDocs_taxonomy' );

	// Register the "categories" taxonomy.
	register_taxonomy( 'doc-category', 'doc', $args );

	register_term_meta(
		'doc-category',
		'image',
		array(
			'show_in_rest' => true,
			'single'       => true,
			'type'         => 'integer',
		)
	);

	register_rest_field(
		'doc-category',
		'image',
		array(
			'get_callback'    => function ( $term ) {
				$image_id = get_term_meta( $term['id'], 'image', true );
				if ( $image_id ) {
					$image_url = wp_get_attachment_image_url( $image_id, 'full' );
					return array(
						'url'     => $image_url,
						'id'      => $image_id,
						'alt'     => get_post_meta( $image_id, '_wp_attachment_image_alt', true ),
						'title'   => get_the_title( $image_id ),
						'caption' => wp_get_attachment_caption( $image_id ),
					);
				}
				return null;
			},
			'update_callback' => function ( $value, $term ) {
				if ( ! $value || ! is_numeric( $value ) ) {
					delete_term_meta( $term->term_id, 'image' );
					return;
				}
				update_term_meta( $term->term_id, 'image', (int) $value );
			},
			'schema'          => null,
		)
	);
}

/**
 * Register KB taxonomies.
 *
 * Register the 'group' taxonomy for the Docs post type.
 *
 * @since 1.0.0
 */
function register_doc_group() {

	// Add new taxonomy, make it hierarchical (like categories).
	$labels = array(
		'name'              => __( 'Knowledgebase Groups', 'simple-docs' ),
		'singular_name'     => __( 'Knowledgebase Group', 'simple-docs' ),
		'search_items'      => __( 'Search Knowledgebase Group', 'simple-docs' ),
		'all_items'         => __( 'All Knowledgebase Groups', 'simple-docs' ),
		'parent_item'       => __( 'Parent Knowledgebase Group', 'simple-docs' ),
		'parent_item_colon' => __( 'Parent Knowledgebase Group:', 'simple-docs' ),
		'view_item'         => __( 'View Group', 'simple-docs' ),
		'edit_item'         => __( 'Edit Knowledgebase Group', 'simple-docs' ),
		'update_item'       => __( 'Update Knowledgebase Group', 'simple-docs' ),
		'add_new_item'      => __( 'Add New Knowledgebase Group', 'simple-docs' ),
		'new_item_name'     => __( 'New Knowledgebase Group Name', 'simple-docs' ),
		'back_to_items'     => __( '← Back to Doc Groups' ),
		'menu_name'         => __( 'Groups', 'simple-docs' ),
	);

	$rewrite = array(
		'slug'         => get_option( 'SimpleDocs_group_prefix', 'doc-group' ),
		'with_front'   => false,
		'hierarchical' => true,
	);

	$args = array(
		'hierarchical'      => true,
		'labels'            => $labels,
		'singular_label'    => __( 'Knowledgebase Group', 'simple-docs' ),
		'show_admin_column' => true,
		'show_ui'           => true,
		'show_in_rest'      => true,
		'query_var'         => true,
		'has_archive'       => true,
		'rewrite'           => $rewrite,
	);

	/**
	 * Filter the arguments for the 'SimpleDocs_taxonomy' taxonomy
	 *
	 * @param array  $args
	 * @param string $taxonomy
	 */
	$args = apply_filters( 'simple_docs_register_taxonomy_args', $args, 'SimpleDocs_taxonomy' );

	// Register the "categories" taxonomy.
	register_taxonomy( 'doc-group', 'doc', $args );

	register_term_meta(
		'doc-group',
		'image',
		array(
			'show_in_rest' => true,
			'single'       => true,
			'type'         => 'integer',
		)
	);
}

function register_template() {
	if ( function_exists( 'register_block_template' ) ) {
		register_block_pattern(
			'simple-docs/doc-header',
			array(
				'title'       => __( 'My First Block Pattern', 'simple-docs' ),
				'description' => _x( 'This is my first block pattern', 'Block pattern description', 'simple-docs' ),
				'blockTypes'  => array( 'core/template-part/header' ),
				'content'     => get_template_content( 'header.php' ),
				'categories'  => array( 'header' ),
				'keywords'    => array( 'cta', 'demo', 'example' ),
			)
		);
		register_block_template(
			'simple-docs//archive-doc',
			array(
				'title'       => __( 'Archive: Docs', 'simple-docs' ),
				'description' => __( 'A block template to show doc article archive.', 'simple-docs' ),
				'content'     => get_template_content( 'archive-doc.php' ),
				'post_types'  => array( 'doc' ),
				'plugin'      => 'simple-docs',
			)
		);
		register_block_template(
			'simple-docs//single-doc',
			array(
				'title'       => __( 'Single: Doc', 'simple-docs' ),
				'description' => __( 'A block template to show doc article.', 'simple-docs' ),
				'content'     => get_template_content( 'single-doc.php' ),
				'post_types'  => array( 'doc' ),
				'plugin'      => 'simple-docs',
			)
		);
		register_block_template(
			'simple-docs//taxonomy-doc-category',
			array(
				'title'       => __( 'Doc Category', 'simple-docs' ),
				'description' => __( 'A block template to show doc category archive.', 'simple-docs' ),
				'content'     => get_template_content( 'taxonomy-doc-category.php' ),
				'plugin'      => 'simple-docs',
			)
		);
		register_block_template(
			'simple-docs//taxonomy-doc_group',
			array(
				'title'       => __( 'Doc Group', 'simple-docs' ),
				'description' => __( 'A block template to show doc group archive.', 'simple-docs' ),
				'content'     => get_template_content( 'taxonomy-doc-group.php' ),
				'plugin'      => 'simple-docs',
			)
		);
	}//end if
}

/**
 * Register templates
 *
 * @param string $template
 */
function get_template_content( $template ) {
	$dir = plugin_dir_path( __DIR__ );
	ob_start();
	include "{$dir}/templates/{$template}";
	return ob_get_clean();
}

add_action( 'init', __NAMESPACE__ . '\register_docs', 1 );
add_action( 'init', __NAMESPACE__ . '\register_doc_category', 0 );
add_action( 'init', __NAMESPACE__ . '\register_doc_group', 0 );
add_action( 'init', __NAMESPACE__ . '\register_template' );
