/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import TermFormDialog from 'calypso/blocks/term-form-dialog';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getEditedPostValue } from 'calypso/state/posts/selectors';
import { getPostTypeTaxonomy } from 'calypso/state/post-types/taxonomies/selectors';
import { getTerms } from 'calypso/state/terms/selectors';

/**
 * Style dependencies
 */
import './add-term.scss';

class TermSelectorAddTerm extends Component {
	static propTypes = {
		labels: PropTypes.object,
		onSuccess: PropTypes.func,
		taxonomy: PropTypes.string,
		terms: PropTypes.array,
		type: PropTypes.string,
	};

	static defaultProps = {
		onSuccess: noop,
	};

	constructor( props ) {
		super( props );
		this.state = {
			showDialog: false,
		};
	}

	openDialog = ( event ) => {
		event.preventDefault();
		this.setState( { showDialog: true } );
	};

	closeDialog = () => {
		this.setState( { showDialog: false } );
	};

	render() {
		const { labels, onSuccess, type, terms, taxonomy } = this.props;
		const totalTerms = terms ? terms.length : 0;
		const classes = classNames( 'editor-term-selector__add-term', {
			'is-compact': totalTerms < 8,
		} );

		return (
			<div className={ classes }>
				<Button borderless compact onClick={ this.openDialog }>
					<Gridicon icon="folder" /> { labels.add_new_item }
				</Button>
				<TermFormDialog
					showDialog={ this.state.showDialog }
					onClose={ this.closeDialog }
					postType={ type }
					taxonomy={ taxonomy }
					onSuccess={ onSuccess }
				/>
			</div>
		);
	}
}

export default connect( ( state, { taxonomy } ) => {
	const siteId = getSelectedSiteId( state );
	const postId = getEditorPostId( state );
	const type = getEditedPostValue( state, siteId, postId, 'type' );
	const taxonomyDetails = getPostTypeTaxonomy( state, siteId, type, taxonomy );
	const labels = get( taxonomyDetails, 'labels', {} );

	return {
		terms: getTerms( state, siteId, taxonomy ),
		labels,
		type,
	};
} )( TermSelectorAddTerm );
