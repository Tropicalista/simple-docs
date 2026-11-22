/**
 * WordPress dependencies
 */
import { Page } from '@wordpress/admin-ui';
import { __ } from '@wordpress/i18n';
import { useNavigate, Link } from '@wordpress/route';
import * as React from 'react';
import { Button, Link as UILink } from '@wordpress/ui';

import './style.scss';


export default function Stage() {
	const navigate = useNavigate();

	return (
		<Page
			title={ __( 'Minimal WP-Build Test', 'minimal-wp-build-test' ) }
			subTitle={ __(
				'This is a minimal wp-build route that renders DataViews.',
				'minimal-wp-build-test'
			) }
			actions={
				<Button onClick={
					() => navigate( {
						to: `/`,
					} )					
				}>
					TEST
				</Button>
			}
			navigation={{
			  currentHref: "/settings",
			  items: [
			    {
			      href: "#",
			      label: "Home"
			    },
			    {
			      href: "#settings",
			      label: "Settings"
			    },
			  ],
			}}
		>
			<div className="minimal-wp-build-test">
				<div className="dataviews-wrapper">
					<h1>CIAO STRONZO SETTINGS</h1>
				</div>
			</div>
		</Page>
	);
}

export { Stage as stage };
