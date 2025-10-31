import React from "react";
import { Helmet } from "react-helmet-async";

const DEFAULT_TWITTER_CARD = "summary_large_image";

function safeString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  return String(value).trim();
}

export default function DynamicMetaTags({
  documentTitle,
  title,
  ogTitle,
  twitterTitle,
  description,
  ogDescription,
  twitterDescription,
  canonicalUrl,
  ogType,
  ogImage,
  ogImageAlt,
  twitterCard,
  twitterImage,
  twitterImageAlt,
  siteName,
  articleAuthor,
  articlePublishedTime,
  additionalMeta = [],
  children,
}) {
  const titleValue = safeString(title);
  const documentTitleValue = safeString(documentTitle || titleValue);
  const ogTitleValue = safeString(ogTitle || titleValue);
  const twitterTitleValue = safeString(twitterTitle || ogTitleValue || documentTitleValue);

  const descriptionValue = safeString(description);
  const ogDescriptionValue = safeString(ogDescription || descriptionValue);
  const twitterDescriptionValue = safeString(twitterDescription || ogDescriptionValue || descriptionValue);

  const canonicalValue = safeString(canonicalUrl);
  const ogTypeValue = safeString(ogType);
  const ogImageValue = safeString(ogImage);
  const twitterCardValue = safeString(twitterCard) || DEFAULT_TWITTER_CARD;
  const ogImageAltValue = safeString(ogImageAlt);
  const twitterImageValue = safeString(twitterImage || ogImageValue);
  const twitterImageAltValue = safeString(twitterImageAlt || ogImageAltValue);
  const siteNameValue = safeString(siteName);
  const articleAuthorValue = safeString(articleAuthor);
  const articlePublishedTimeValue = safeString(articlePublishedTime);

  const normalizedAdditionalMeta = Array.isArray(additionalMeta)
    ? additionalMeta
        .map((meta) => {
          if (!meta) return null;
          const name = safeString(meta.name);
          const property = safeString(meta.property);
          const content = safeString(meta.content);
          if (!content || (!name && !property)) return null;
          return {
            key: meta.key,
            name: name || undefined,
            property: property || undefined,
            content,
          };
        })
        .filter(Boolean)
    : [];

  if (
    !documentTitleValue &&
    !titleValue &&
    !descriptionValue &&
    !canonicalValue &&
    !ogTypeValue &&
    !ogImageValue &&
    !twitterImageValue &&
    !siteNameValue &&
    !articleAuthorValue &&
    !articlePublishedTimeValue &&
    normalizedAdditionalMeta.length === 0 &&
    !children
  ) {
    return null;
  }

  return (
    <Helmet>
      {documentTitleValue && <title>{documentTitleValue}</title>}
      {descriptionValue && <meta name="description" content={descriptionValue} />}
      {canonicalValue && <link rel="canonical" href={canonicalValue} />}

      {ogTypeValue && <meta property="og:type" content={ogTypeValue} />}
      {ogTitleValue && <meta property="og:title" content={ogTitleValue} />}
      {ogDescriptionValue && <meta property="og:description" content={ogDescriptionValue} />}
      {canonicalValue && <meta property="og:url" content={canonicalValue} />}
      {ogImageValue && <meta property="og:image" content={ogImageValue} />}
      {ogImageAltValue && <meta property="og:image:alt" content={ogImageAltValue} />}
      {siteNameValue && <meta property="og:site_name" content={siteNameValue} />}

      <meta name="twitter:card" content={twitterCardValue || DEFAULT_TWITTER_CARD} />
      {(twitterTitleValue || ogTitleValue) && (
        <meta name="twitter:title" content={twitterTitleValue || ogTitleValue} />
      )}
      {(twitterDescriptionValue || ogDescriptionValue) && (
        <meta name="twitter:description" content={twitterDescriptionValue || ogDescriptionValue} />
      )}
      {twitterImageValue && <meta name="twitter:image" content={twitterImageValue} />}
      {twitterImageAltValue && <meta name="twitter:image:alt" content={twitterImageAltValue} />}

      {articlePublishedTimeValue && (
        <meta property="article:published_time" content={articlePublishedTimeValue} />
      )}
      {articleAuthorValue && <meta property="article:author" content={articleAuthorValue} />}

      {normalizedAdditionalMeta.map((meta, index) => (
        <meta
          key={meta.key || `${meta.name || meta.property}-${index}`}
          {...(meta.name ? { name: meta.name } : { property: meta.property })}
          content={meta.content}
        />
      ))}

      {children}
    </Helmet>
  );
}

