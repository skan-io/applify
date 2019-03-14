

export const createSassLintConfigTask = ()=> `files:
  include: 'src/**/*.s+(a|c)ss'

rules:
  property-sort-order:
    - 0
    -
      order: concentric

  no-misspelled-properties:
    - 2
    -
      extra-properties:
        - overflow-scrolling

  no-vendor-prefixes:
  - 2
  -
    ignore-non-standard: true

  no-important:
    - 0
  no-url-domains:
    - 0
  no-url-protocols:
    - 0
`;
