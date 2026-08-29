type Props = {
  businessName: string;
  url: string;
  telephone: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
};

export function StructuredData({
  businessName,
  url,
  telephone,
  whatsapp,
  address,
  city,
  country,
}: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: businessName,
    url,
    telephone: `+${telephone}`,
    sameAs: [`https://wa.me/${whatsapp}`],
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: city,
      addressCountry: country,
    },
    areaServed: "Lagos, Nigeria",
    description:
      "DMECH Services Limited provides automotive diagnostics, EV service, vehicle sales, financing, and workshop repairs in Lagos, Nigeria.",
    priceRange: "$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
