import { Page } from '@wordpress/admin-ui';
import { Button, Modal, Notice, SelectControl, Spinner, TextControl, TextareaControl } from '@wordpress/components';
import { store as coreDataStore, useEntityRecords } from '@wordpress/core-data';
import { DataViews, type Field, type View } from '@wordpress/dataviews';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import * as React from 'react';

import './style.scss';

type Taxonomy = {
	slug: string;
	name: string;
	rest_base?: string;
};

type Term = {
	id: number;
	name: string;
	slug: string;
	description: string;
	count: number;
	taxonomy: string;
};

const fields: Field<Term>[] = [
	{ id: 'name', label: __( 'Nome', 'polar' ), type: 'text' },
	{ id: 'slug', label: __( 'Slug', 'polar' ), type: 'text' },
	{ id: 'description', label: __( 'Descrizione', 'polar' ), type: 'text' },
	{ id: 'count', label: __( 'Elementi', 'polar' ), type: 'integer' },
];

const initialView: View = {
	type: 'table',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
	fields: [ 'name', 'slug', 'description', 'count' ],
	titleField: 'name',
};

export default function Stage() {
	const [ taxonomySlug, setTaxonomySlug ] = React.useState( 'doc-category' );
	const [ view, setView ] = React.useState( initialView );
	const [ isModalOpen, setIsModalOpen ] = React.useState( false );
	const [ editingTerm, setEditingTerm ] = React.useState<Term | undefined>();
	const [ form, setForm ] = React.useState( { name: '', slug: '', description: '' } );
	const [ isSaving, setIsSaving ] = React.useState( false );
	const [ errorMessage, setErrorMessage ] = React.useState( '' );
	const [ successMessage, setSuccessMessage ] = React.useState( '' );
	const { saveEntityRecord } = useDispatch( coreDataStore );

	const {
		records: taxonomies,
		isResolving: isLoadingTaxonomies,
	} = useEntityRecords<Taxonomy>( 'root', 'taxonomy', { context: 'edit' } );

	React.useEffect( () => {
		if ( ! taxonomies?.length ) {
			return;
		}

		if ( ! taxonomies.some( ( taxonomy ) => taxonomy.slug === taxonomySlug ) ) {
			setTaxonomySlug(
				taxonomies.find( ( taxonomy ) => taxonomy.slug === 'doc-category' )?.slug ??
					taxonomies[ 0 ].slug
			);
		}
	}, [ taxonomies, taxonomySlug ] );

	const {
		records: terms,
		isResolving: isLoadingTerms,
		totalItems,
		totalPages,
	} = useEntityRecords<Term>(
		'taxonomy',
		taxonomySlug,
		{
			context: 'edit',
			page: view.page ?? 1,
			per_page: view.perPage ?? 10,
			search: view.search ?? '',
			orderby: view.sort?.field ?? 'name',
			order: view.sort?.direction ?? 'asc',
		},
		{ enabled: Boolean( taxonomySlug ) }
	);

	const taxonomyOptions = ( taxonomies ?? [] )
		.filter( ( taxonomy ) => taxonomy.rest_base )
		.map( ( taxonomy ) => ( {
			label: taxonomy.name,
			value: taxonomy.slug,
		} ) );

	const openCreateModal = () => {
		setEditingTerm( undefined );
		setForm( { name: '', slug: '', description: '' } );
		setErrorMessage( '' );
		setIsModalOpen( true );
	};

	const openEditModal = ( term: Term ) => {
		setEditingTerm( term );
		setForm( {
			name: term.name,
			slug: term.slug,
			description: term.description,
		} );
		setErrorMessage( '' );
		setIsModalOpen( true );
	};

	const closeModal = () => {
		if ( ! isSaving ) {
			setIsModalOpen( false );
		}
	};

	const saveTerm = async ( event: React.FormEvent<HTMLFormElement> ) => {
		event.preventDefault();
		setIsSaving( true );
		setErrorMessage( '' );
		setSuccessMessage( '' );

		try {
			await saveEntityRecord( 'taxonomy', taxonomySlug, {
				...( editingTerm ? { id: editingTerm.id } : {} ),
				name: form.name.trim(),
				slug: form.slug.trim(),
				description: form.description,
			} );
			setIsModalOpen( false );
			setSuccessMessage(
				editingTerm
					? __( 'Termine aggiornato.', 'polar' )
					: __( 'Termine creato.', 'polar' )
			);
		} catch ( error ) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: __( 'Impossibile salvare il termine.', 'polar' )
			);
		} finally {
			setIsSaving( false );
		}
	};

	return (
		<Page
			title={ __( 'Termini della tassonomia', 'polar' ) }
			subTitle={ __( 'Cerca, crea e modifica i termini delle tassonomie disponibili via REST.', 'polar' ) }
			actions={
				<Button
					variant="primary"
					onClick={ openCreateModal }
					disabled={ ! taxonomySlug || isLoadingTaxonomies }
				>
					{ __( 'Aggiungi termine', 'polar' ) }
				</Button>
			}
		>
			<div className="polar-taxonomy-page">
				{ errorMessage && ! isModalOpen && (
					<Notice status="error" isDismissible onRemove={ () => setErrorMessage( '' ) }>
						{ errorMessage }
					</Notice>
				) }
				{ successMessage && (
					<Notice status="success" isDismissible onRemove={ () => setSuccessMessage( '' ) }>
						{ successMessage }
					</Notice>
				) }
				{ isLoadingTaxonomies ? (
					<Spinner />
				) : taxonomyOptions.length === 0 ? (
					<Notice status="warning" isDismissible={ false }>
						{ __( 'Non ci sono tassonomie disponibili tramite REST API.', 'polar' ) }
					</Notice>
				) : (
					<>
						<div className="polar-taxonomy-page__toolbar">
							<SelectControl
								label={ __( 'Tassonomia', 'polar' ) }
								value={ taxonomySlug }
								options={ taxonomyOptions }
								onChange={ ( value ) => {
									setTaxonomySlug( value );
									setView( initialView );
									setSuccessMessage( '' );
								} }
							/>
						</div>
						<DataViews
							data={ terms ?? [] }
							fields={ fields }
							view={ view }
							onChangeView={ setView }
							onClickItem={ openEditModal }
							getItemId={ ( term ) => String( term.id ) }
							isLoading={ isLoadingTerms }
							paginationInfo={ {
								totalItems: totalItems ?? 0,
								totalPages: totalPages ?? 1,
							} }
							defaultLayouts={ { table: true } }
							config={ { perPageSizes: [ 10, 25, 50 ] } }
							empty={ __( 'Nessun termine trovato.', 'polar' ) }
						/>
					</>
				) }
			</div>

			{ isModalOpen && (
				<Modal
					title={
						editingTerm
							? __( 'Modifica termine', 'polar' )
							: __( 'Nuovo termine', 'polar' )
					}
					onRequestClose={ closeModal }
				>
					<form onSubmit={ saveTerm } className="polar-taxonomy-page__form">
						{ errorMessage && (
							<Notice status="error" isDismissible={ false }>
								{ errorMessage }
							</Notice>
						) }
						<TextControl
							label={ __( 'Nome', 'polar' ) }
							value={ form.name }
							onChange={ ( name ) => setForm( { ...form, name } ) }
							required
						/>
						<TextControl
							label={ __( 'Slug', 'polar' ) }
							value={ form.slug }
							onChange={ ( slug ) => setForm( { ...form, slug } ) }
							help={ __( 'Lascia vuoto per generarlo dal nome.', 'polar' ) }
						/>
						<TextareaControl
							label={ __( 'Descrizione', 'polar' ) }
							value={ form.description }
							onChange={ ( description ) => setForm( { ...form, description } ) }
						/>
						<div className="polar-taxonomy-page__form-actions">
							<Button variant="tertiary" onClick={ closeModal } disabled={ isSaving }>
								{ __( 'Annulla', 'polar' ) }
							</Button>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! form.name.trim() }
							>
								{ __( 'Salva', 'polar' ) }
							</Button>
						</div>
					</form>
				</Modal>
			) }
		</Page>
	);
}

export { Stage as stage };
