import { useState, useMemo } from '@wordpress/element';
import { useEntityRecords } from '@wordpress/core-data';
import { DataViews } from '@wordpress/dataviews';

export function TaxonomyTermsDataView() {
	const [ view, setView ] = useState( {
		type: 'table',
		perPage: 10,
		page: 1,
		search: '',
		sort: { field: 'name', direction: 'asc' },
		fields: [ 'name', 'slug', 'count' ],
	} );

	const queryArgs = useMemo(
		() => ( {
			per_page: view.perPage,
			page: view.page,
			search: view.search || undefined,
			orderby: view.sort?.field || 'name',
			order: view.sort?.direction || 'asc',
		} ),
		[ view ]
	);

	const {
		records: terms,
		totalItems,
		totalPages,
		isResolving,
	} = useEntityRecords(
		'taxonomy',
		'category', // Replace with your custom taxonomy slug
		queryArgs
	);

	const fields = [
		{
			id: 'name',
			label: 'Name',
			enableGlobalSearch: true,
			enableSorting: true,
		},
		{
			id: 'slug',
			label: 'Slug',
			enableSorting: true,
		},
		{
			id: 'count',
			label: 'Count',
			enableSorting: true,
		},
	];

	return (
		<DataViews
			data={ terms || [] }
			fields={ fields }
			view={ view }
			onChangeView={ setView }
			isLoading={ isResolving }
			paginationInfo={ {
				totalItems: totalItems || 0,
				totalPages: totalPages || 1,
			} }
			defaultLayouts={ { table: {}, grid: {} } }
		/>
	);
}
