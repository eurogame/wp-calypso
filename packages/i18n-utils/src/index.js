/**
 * External dependencies
 */
import { isString } from 'lodash';
import i18n, { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getUrlParts, getUrlFromParts } from './url-parts';
import { languagesBySlug, languageSlugs } from '@automattic/languages';

/**
 * Config replacements
 */
export const i18nDefaultLocaleSlug = 'en';
export const localesWithBlog = [ 'en', 'ja', 'es', 'pt', 'fr', 'pt-br' ];
export const localesWithPrivacyPolicy = [ 'en', 'fr', 'de' ];
export const localesWithCookiePolicy = [ 'en', 'fr', 'de' ];
export const localesToSubdomains = {
	'pt-br': 'br',
	br: 'bre',
	zh: 'zh-cn',
	'zh-hk': 'zh-tw',
	'zh-sg': 'zh-cn',
	kr: 'ko',
};
export const livechatSupportLocales = [ 'en', 'es', 'pt-br' ];
export const supportSiteLocales = [
	'ar',
	'de',
	'en',
	'es',
	'fr',
	'he',
	'id',
	'it',
	'ja',
	'ko',
	'nl',
	'pt-br',
	'ru',
	'sv',
	'tr',
	'zh-cn',
	'zh-tw',
];

export const forumLocales = [
	'ar',
	'de',
	'el',
	'en',
	'es',
	'fa',
	'fi',
	'fr',
	'id',
	'it',
	'ja',
	'nl',
	'pt',
	'pt-br',
	'ru',
	'sv',
	'th',
	'tl',
	'tr',
];
export const magnificentNonEnLocales = [
	'es',
	'pt-br',
	'de',
	'fr',
	'he',
	'ja',
	'it',
	'nl',
	'ru',
	'tr',
	'id',
	'zh-cn',
	'zh-tw',
	'ko',
	'ar',
	'sv',
];
export const jetpackComLocales = [
	'en',
	'ar',
	'de',
	'es',
	'fr',
	'he',
	'id',
	'it',
	'ja',
	'ko',
	'nl',
	'pt-br',
	'ro',
	'ru',
	'sv',
	'tr',
	'zh-cn',
	'zh-tw',
];

export function getPathParts( path ) {
	// Remove trailing slash then split. If there is a trailing slash,
	// then the end of the array could contain an empty string.
	return path.replace( /\/$/, '' ).split( '/' );
}

/**
 * Checks if provided locale is a default one.
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the default locale is provided
 */
export function isDefaultLocale( locale ) {
	return locale === i18nDefaultLocaleSlug;
}

/**
 * Checks if provided locale has a parentLangSlug and is therefore a locale variant
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the locale has a parentLangSlug
 */
export function isLocaleVariant( locale ) {
	if ( ! isString( locale ) ) {
		return false;
	}
	const language = getLanguage( locale );
	return !! language && isString( language.parentLangSlug );
}

export function isLocaleRtl( locale ) {
	if ( ! isString( locale ) ) {
		return null;
	}
	const language = getLanguage( locale );
	if ( ! language ) {
		return null;
	}

	return Boolean( language.rtl );
}

/**
 * Checks against a list of locales that don't have any GP translation sets
 * A 'translation set' refers to a collection of strings to be translated see:
 * https://glotpress.blog/the-manual/translation-sets/
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the locale is NOT a member of the exception list
 */
export function canBeTranslated( locale ) {
	return [ 'en', 'sr_latin' ].indexOf( locale ) === -1;
}

/**
 * To be used with the same parameters as i18n-calpyso's translate():
 * Check whether the user would be exposed to text not in their language.
 *
 * Since the text is in English, this is always true in that case. Otherwise
 * We check whether a translation was provided for this text.
 *
 * @returns {boolean} true when a user would see text they can read.
 */
export function translationExists() {
	const localeSlug = typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en';
	return isDefaultLocale( localeSlug ) || i18n.hasTranslation( ...arguments );
}

/**
 * Return a specifier for page.js/Express route param that enumerates all supported languages.
 *
 * @param {string} name of the parameter. By default it's `lang`, some routes use `locale`.
 * @param {boolean} optional whether to put the `?` character at the end, making the param optional
 * @returns {string} Router param specifier that looks like `:lang(cs|de|fr|pl)`
 */
export function getLanguageRouteParam( name = 'lang', optional = true ) {
	return `:${ name }(${ languageSlugs.join( '|' ) })${ optional ? '?' : '' }`;
}

/**
 * a locale can consist of three component
 * aa: language code
 * -bb: regional code
 * _cc: variant suffix
 * while the language code is mandatory, the other two are optional.
 */
const localeRegex = /^[A-Z]{2,3}(-[A-Z]{2,3})?(_[A-Z]{2,6})?$/i;

/**
 * Matches and returns language from config.languages based on the given localeSlug
 *
 * @param   {string} langSlug locale slug of the language to match
 * @returns {object|undefined} An object containing the locale data or undefined.
 */
export function getLanguage( langSlug ) {
	if ( localeRegex.test( langSlug ) ) {
		// Find for the langSlug first. If we can't find it, split it and find its parent slug.
		// Please see the comment above `localeRegex` to see why we can split by - or _ and find the parent slug.
		return languagesBySlug[ langSlug ] || languagesBySlug[ langSlug.split( /[-_]/ )[ 0 ] ];
	}

	return undefined;
}

/**
 * Assuming that locale is adding at the end of path, retrieves the locale if present.
 *
 * @param {string} path - original path
 * @returns {string|undefined} The locale slug if present or undefined
 */
export function getLocaleFromPath( path ) {
	const urlParts = getUrlParts( path );
	const locale = getPathParts( urlParts.pathname ).pop();

	return 'undefined' === typeof getLanguage( locale ) ? undefined : locale;
}

/**
 * Adds a locale slug to the current path.
 *
 * Will replace existing locale slug, if present.
 *
 * @param {string} path - original path
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {string} original path with new locale slug
 */
export function addLocaleToPath( path, locale ) {
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';

	return removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
}

const setLocalizedUrlHost = ( hostname, validLocales = [] ) => ( urlParts, localeSlug ) => {
	if ( validLocales.includes( localeSlug ) && localeSlug !== 'en' ) {
		// Avoid changing the hostname when the locale is set via the path.
		if ( urlParts.pathname.substr( 0, localeSlug.length + 2 ) !== '/' + localeSlug + '/' ) {
			urlParts.host = `${ localesToSubdomains[ localeSlug ] || localeSlug }.${ hostname }`;
		}
	}
	return urlParts;
};

const setLocalizedWpComPath = ( prefix, validLocales = [], limitPathMatch = null ) => (
	urlParts,
	localeSlug
) => {
	urlParts.host = 'wordpress.com';
	if (
		typeof limitPathMatch === 'object' &&
		limitPathMatch instanceof RegExp &&
		! limitPathMatch.test( urlParts.pathname )
	) {
		validLocales = []; // only rewrite to English.
	}
	urlParts.pathname = prefix + urlParts.pathname;

	if ( validLocales.includes( localeSlug ) && localeSlug !== 'en' ) {
		urlParts.pathname = ( localesToSubdomains[ localeSlug ] || localeSlug ) + urlParts.pathname;
	}
	return urlParts;
};

const prefixLocalizedUrlPath = ( validLocales = [], limitPathMatch = null ) => (
	urlParts,
	localeSlug
) => {
	if ( typeof limitPathMatch === 'object' && limitPathMatch instanceof RegExp ) {
		if ( ! limitPathMatch.test( urlParts.pathname ) ) {
			return urlParts; // No rewriting if not matches the path.
		}
	}

	if ( validLocales.includes( localeSlug ) && localeSlug !== 'en' ) {
		urlParts.pathname = ( localesToSubdomains[ localeSlug ] || localeSlug ) + urlParts.pathname;
	}
	return urlParts;
};

const urlLocalizationMapping = {
	'wordpress.com/support/': prefixLocalizedUrlPath( livechatSupportLocales ),
	'wordpress.com/blog/': prefixLocalizedUrlPath( localesWithBlog, /^\/blog\/?$/ ),
	'wordpress.com/tos/': setLocalizedUrlHost( 'wordpress.com', magnificentNonEnLocales ),
	'jetpack.com': setLocalizedUrlHost( 'jetpack.com', jetpackComLocales ),
	'en.support.wordpress.com': setLocalizedWpComPath( '/support', supportSiteLocales ),
	'en.blog.wordpress.com': setLocalizedWpComPath( '/blog', localesWithBlog, /^\/$/ ),
	'en.forums.wordpress.com': setLocalizedUrlHost( 'forums.wordpress.com', forumLocales ),
	'automattic.com/privacy/': prefixLocalizedUrlPath( localesWithPrivacyPolicy ),
	'automattic.com/cookies/': prefixLocalizedUrlPath( localesWithCookiePolicy ),
	'wordpress.com': setLocalizedUrlHost( 'wordpress.com', magnificentNonEnLocales ),
};

export function localizeUrl( fullUrl, locale ) {
	const localeSlug = locale || ( typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en' );
	const urlParts = getUrlParts( String( fullUrl ) );

	if ( ! urlParts.host ) {
		return fullUrl;
	}

	// Let's unify the URL.
	urlParts.protocol = 'https:';
	// Let's use `host` for everything.
	delete urlParts.hostname;

	if ( ! urlParts.pathname.endsWith( '.php' ) ) {
		urlParts.pathname = ( urlParts.pathname + '/' ).replace( /\/+$/, '/' );
	}

	if ( ! localeSlug || 'en' === localeSlug ) {
		if ( 'en.wordpress.com' === urlParts.host ) {
			urlParts.host = 'wordpress.com';
			return getUrlFromParts( urlParts ).href;
		}
	}

	if ( 'en.wordpress.com' === urlParts.host ) {
		urlParts.host = 'wordpress.com';
	}

	const lookup = [
		urlParts.host,
		urlParts.host + urlParts.pathname,
		urlParts.host + urlParts.pathname.substr( 0, 1 + urlParts.pathname.indexOf( '/', 1 ) ),
	];

	for ( let i = lookup.length - 1; i >= 0; i-- ) {
		if ( lookup[ i ] in urlLocalizationMapping ) {
			return getUrlFromParts( urlLocalizationMapping[ lookup[ i ] ]( urlParts, localeSlug ) ).href;
		}
	}

	// Nothing needed to be changed, just return it unmodified.
	return fullUrl;
}

/**
 * Removes the trailing locale slug from the path, if it is present.
 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
 *
 * @param {string} path - original path
 * @returns {string} original path minus locale slug
 */
export function removeLocaleFromPath( path ) {
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';
	const parts = getPathParts( urlParts.pathname );
	const locale = parts.pop();

	if ( 'undefined' === typeof getLanguage( locale ) ) {
		parts.push( locale ); // locale not present, push whatever this was back onto the stack
	}

	return parts.join( '/' ) + queryString;
}

/**
 * Checks if provided locale is one of the magnificenet non-english locales.
 *
 * @param   {string}  locale Locale slug
 * @returns {boolean} true when provided magnificent non-english locale.
 */
export function isMagnificentLocale( locale ) {
	return magnificentNonEnLocales.includes( locale );
}

/**
 * Checks if provided locale is translated incompletely (is missing essential translations).
 *
 * @param   {string}  locale Locale slug
 * @returns {boolean} Whether provided locale is flagged as translated incompletely.
 */
export function isTranslatedIncompletely( locale ) {
	return getLanguage( locale )?.isTranslatedIncompletely === true;
}
