/**
 * WordPress dependencies
 */

export const route = {
	beforeLoad: () => {
	},
	/**
	 * Render the default boot canvas editor when `editPostId` is present.
	 *
	 * @param context - Route loader context.
	 * @return Canvas data or undefined.
	 */
	canvas: async ( { search }: { search: { editPostId?: number | string } } ) => {
		if ( ! search?.editPostId ) {
			return undefined;
		}

		return {
			postType: 'post',
			postId: String( search.editPostId ),
			isPreview: false,
		};
	},
};
