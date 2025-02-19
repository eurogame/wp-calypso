/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';

export function useTitle() {
	const domain = useSelect( ( select ) => select( LAUNCH_STORE ).getSelectedDomain() );
	const { setDomainSearch } = useDispatch( LAUNCH_STORE );
	const [ title, setTitle ] = useEntityProp( 'root', 'site', 'title' );
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const { saveEditedEntityRecord } = useDispatch( 'core' );

	const handleSave = ( newTitle = title ) => {
		setTitle( newTitle.trim() );
		saveEditedEntityRecord( 'root', 'site' );

		// update domainSearch only if there is no custom Domain selected
		! domain && setDomainSearch( newTitle );
	};
	return {
		title,
		updateTitle: setTitle,
		saveTitle: handleSave,
	};
}
