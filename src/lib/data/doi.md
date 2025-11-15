# Crossref REST API `/works/{doi}` Guide

This document is a concise, structured markdown document summarising all major fields available from the Crossref REST API endpoint `/works/{doi}`

Each field represents metadata describing a single scholarly output identified by a DOI.

## Quick Example Fetch

```http
GET https://api.crossref.org/works/{doi}
```

Returns everything summarised above.

```
▶ Full metadata for the specified DOI
▶ Rich contributor & funder structure
▶ Publication lifecycle tracking
▶ Links to all related works, versions, and updates
```

## Summary: Major Data Categories

| Category       | Example Fields                          | Purpose                             |
| -------------- | --------------------------------------- | ----------------------------------- |
| Identification | `DOI`, `URL`, `prefix`                  | Uniquely identifies the work        |
| Contributors   | `author[]`, `editor[]`                  | Authorship and editorial roles      |
| Publication    | `issued`, `published-online`            | When and how the work was published |
| Container      | `ISSN`, `volume`, `issue`               | Journal/series metadata             |
| Access         | `license[]`, `link[]`                   | Rights and fulltext access          |
| Funding        | `funder[]`, `project[]`                 | Financial and project provenance    |
| References     | `reference[]`, `is-referenced-by-count` | Citation structure                  |
| Relations      | `relation`, `update-to`                 | Links between works                 |
| Content        | `title`, `abstract`, `subtitle`         | Intellectual description            |
| Institutional  | `institution[]`, `publisher`            | Organisational links                |


### Top-Level Fields

| Field             | Type   | Description        | Sample    |
| ----------------- | ------ | ------------------ | --------- |
| `status`          | string | API status         | `"ok"`    |
| `message-type`    | string | Object type        | `"work"`  |
| `message-version` | string | Schema version     | `"1.0.0"` |
| `message`         | object | Full work metadata | `{...}`   |


## 1. Core Work Identification

| Field     | Type   | Description               | Sample                  |
| --------- | ------ | ------------------------- | ----------------------- |
| `DOI`     | string | Digital Object Identifier | `"10.5555/12345678"`    |
| `URL`     | string | Landing page              | `"https://doi.org/..."` |
| `type`    | string | Work type                 | `"journal-article"`     |
| `prefix`  | string | DOI prefix                | `"10.5555"`             |
| `member`  | string | Crossref member ID        | `"7822"`                |
| `source`  | string | Source of metadata        | `"Crossref"`            |
| `score`   | number | Search relevance score    | `1.0`                   |
| `subtype` | string | Additional type detail    | `"string"`              |


## 2. Titles, Abstracts & Descriptions

| Field              | Type              | Description              |
| ------------------ | ----------------- | ------------------------ |
| `title[]`          | array(string)     | Full title(s)            |
| `original-title[]` | array(string)     | Original language titles |
| `short-title[]`    | array(string)     | Abbreviations            |
| `subtitle[]`       | array(string)     | Subtitles                |
| `abstract`         | string (JATS/XML) | Structured abstract      |
| `description`      | string            | Free-text description    |


## 3. Publication Dates

Nearly all Crossref date objects follow the form:

```json
{
  "date-parts": [[YYYY, MM, DD]],
  "date-time": "...",
  "timestamp": 1234567890000
}
````

| Field                                | Description                             |
| ------------------------------------ | --------------------------------------- |
| `indexed`                            | When the record was indexed in Crossref |
| `created`                            | DOI creation date                       |
| `deposited`                          | Metadata deposit date                   |
| `issued`                             | Official publication date               |
| `published-online`                   | Online publication                      |
| `published-print`                    | Print publication                       |
| `published`                          | Generic publication date                |
| `posted`                             | Preprint posting date                   |
| `approved`, `accepted`               | Acceptance or approval dates            |
| `content-created`, `content-updated` | Content lifecycle                       |
| `published-other`                    | Additional publication status           |


## 4. Authorship & Contributors

Crossref standard contributor object:

| Field                 | Type          | Sample                        |
| --------------------- | ------------- | ----------------------------- |
| `given`               | string        | `"Josiah"`                    |
| `family`              | string        | `"Carberry"`                  |
| `sequence`            | string        | `"first"`                     |
| `ORCID`               | string        | `"0000-0002..."`              |
| `affiliation[]`       | array(object) | `[{name:"Brown University"}]` |
| `authenticated-orcid` | boolean       | `true`                        |

Contributor roles include:
`author`, `editor`, `chair`, `translator`, `investigator`, `lead-investigator`, `co-lead-investigator`.


## 5. Journal / Book Container Information

| Field                     | Type          | Description                             |
| ------------------------- | ------------- | --------------------------------------- |
| `container-title[]`       | array         | Journal/book title                      |
| `short-container-title[]` | array         | Abbrev. journal title                   |
| `ISSN[]`                  | array         | Print/online ISSN                       |
| `issn-type[]`             | array(object) | `"type": "print", "value": "1234-5678"` |
| `ISBN[]`                  | array         | Book identifiers                        |
| `isbn-type[]`             | array(object) | ISBN+type                               |
| `volume`                  | string        | Volume number                           |
| `issue`                   | string        | Issue number                            |
| `issue-title[]`           | array         | Special issue title                     |
| `component-number`        | string        | Component index                         |
| `journal-issue`           | object        | Issue metadata                          |


## 6. Licensing & Access

| Field            | Type          | Description                    |
| ---------------- | ------------- | ------------------------------ |
| `license[]`      | array(object) | Start date, URL, version       |
| `free-to-read`   | object        | Open access periods            |
| `content-domain` | object        | Allowed domains, restrictions  |
| `link[]`         | array(object) | PDFs, XML, supplementary files |

Example license entry:

| Field           | Example                                         |
| --------------- | ----------------------------------------------- |
| `URL`           | `"https://creativecommons.org/licenses/by/4.0"` |
| `delay-in-days` | `0`                                             |


## 7. Funding & Projects

### 7.1 Funder

| Field      | Type          | Description        |
| ---------- | ------------- | ------------------ |
| `funder[]` | array(object) | Funders and awards |
| `award[]`  | array(string) | Grant numbers      |
| `DOI`      | string        | Funder DOI         |

### 7.2 Project Metadata

Includes very rich project data:

| Category          | Fields                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Investigators     | `lead-investigator`, `co-lead-investigator`, `investigator`            |
| Award timeline    | `award-start`, `award-end`, `award-planned-start`, `award-planned-end` |
| Project content   | `project-title`, `project-description`                                 |
| Funding breakdown | `funding[]` with amounts, currencies, percentages                      |


## 8. Citations, References & Relations

### 8.1 References

Each entry contains optional fields such as:

| Field           | Example              |
| --------------- | -------------------- |
| `key`           | `"1"`                |
| `unstructured`  | `"Dietrich (1989)…"` |
| `DOI`           | `"10.5555/987654"`   |
| `article-title` | `"Some Study"`       |
| `year`          | `"1985"`             |

Also:
`issn`, `isbn`, `volume`, `issue`, `first-page`, etc.

### 8.2 Counts

| Field                    | Meaning                      |
| ------------------------ | ---------------------------- |
| `reference-count`        | Total references included    |
| `references-count`       | Synonym used in some records |
| `is-referenced-by-count` | Citation count received      |

### 8.3 Relations

`relation` maps relation types (e.g., `is-reply-to`, `is-version-of`, custom labels) to arrays of identifier objects.

### 8.4 Updates

| Field           | Description                             |
| --------------- | --------------------------------------- |
| `update-to[]`   | Corrections, errata issued for this DOI |
| `updated-by[]`  | Later updates affecting this DOI        |
| `update-policy` | Pointer to publisher’s update policy    |


## 9. Institutional & Organisational Metadata

| Field                | Description                         |
| -------------------- | ----------------------------------- |
| `institution[]`      | Affiliations at institutional level |
| `standards-body`     | Standards publisher metadata        |
| `publisher`          | Journal or book publisher           |
| `publisher-location` | Location string                     |


## 10. Supplementary Categories

| Field                     | Description                      |
| ------------------------- | -------------------------------- |
| `clinical-trial-number[]` | Linked clinical trials           |
| `event`                   | Conference/event metadata        |
| `degree[]`                | Degree type for theses           |
| `subject[]`               | Publisher-supplied subject areas |
| `aliases[]`               | Alternate identifiers            |
| `alternative-id[]`        | IDs beyond DOI                   |
| `article-number`          | Article numbering systems        |
| `group-title`             | Grouped publication title        |


## 11. Assertions & Versions

| Field         | Description                                  |
| ------------- | -------------------------------------------- |
| `assertion[]` | Crossmark assertions (ethics, funding, etc.) |
| `status`      | Publication status and descriptions          |
| `version`     | Version metadata (language, description)     |


## 12. Resources

| Field                  | Description                   |
| ---------------------- | ----------------------------- |
| `resource.primary.URL` | Primary fulltext link         |
| `resource.secondary[]` | Additional labelled resources |

## Sample Response

[10.5555/12345678](https://api.crossref.org/works/10.5555%2F12345678)

```json
{
  "status": "ok",
  "message-type": "work",
  "message-version": "1.0.0",
  "message": {
    "indexed": {
      "date-parts": [
        [2025, 11, 3]
      ],
      "date-time": "2025-11-03T06:19:35Z",
      "timestamp": 1762150775892,
      "version": "build-2065373602"
    },
    "update-to": [
      {
        "updated": {
          "date-parts": [
            [2018, 1, 1]
          ],
          "date-time": "2018-01-01T00:00:00Z",
          "timestamp": 1514764800000
        },
        "DOI": "10.5555/12345678",
        "type": "corrigendum",
        "source": "publisher",
        "label": "Corrigendum"
      }
    ],
    "reference-count": 12,
    "publisher": "Test accounts",
    "issue": "1",
    "license": [
      {
        "start": {
          "date-parts": [
            [2008, 2, 29]
          ],
          "date-time": "2008-02-29T00:00:00Z",
          "timestamp": 1204243200000
        },
        "content-version": "unspecified",
        "delay-in-days": 0,
        "URL": "https://creativecommons.org/licenses/by/4.0"
      },
      {
        "start": {
          "date-parts": [
            [2011, 11, 21]
          ],
          "date-time": "2011-11-21T00:00:00Z",
          "timestamp": 1321833600000
        },
        "content-version": "tdm",
        "delay-in-days": 1361,
        "URL": "http://psychoceramicsproprietrylicenseV1.com"
      },
      {
        "start": {
          "date-parts": [
            [2011, 11, 21]
          ],
          "date-time": "2011-11-21T00:00:00Z",
          "timestamp": 1321833600000
        },
        "content-version": "vor",
        "delay-in-days": 1361,
        "URL": "http://psychoceramicsproprietrylicenseV1.com"
      },
      {
        "start": {
          "date-parts": [
            [2011, 11, 21]
          ],
          "date-time": "2011-11-21T00:00:00Z",
          "timestamp": 1321833600000
        },
        "content-version": "am",
        "delay-in-days": 1361,
        "URL": "http://psychoceramicsproprietrylicenseV1.com"
      },
      {
        "start": {
          "date-parts": [
            [2022, 2, 1]
          ],
          "date-time": "2022-02-01T00:00:00Z",
          "timestamp": 1643673600000
        },
        "content-version": "stm-asf",
        "delay-in-days": 5086,
        "URL": "https://doi.org/10.15223/policy-001"
      }
    ],
    "funder": [
      {
        "DOI": "10.13039/100000001",
        "name": "National Science Foundation",
        "doi-asserted-by": "publisher",
        "award": [
          "12345678"
        ],
        "id": [
          {
            "id": "10.13039/100000001",
            "id-type": "DOI",
            "asserted-by": "publisher"
          }
        ]
      },
      {
        "DOI": "10.13039/100006151",
        "name": "Basic Energy Sciences, Office of Science, U.S. Department of Energy",
        "doi-asserted-by": "publisher",
        "award": [
          "12345679"
        ],
        "id": [
          {
            "id": "10.13039/100006151",
            "id-type": "DOI",
            "asserted-by": "publisher"
          }
        ]
      }
    ],
    "content-domain": {
      "domain": [
        "psychoceramics.labs.crossref.org"
      ],
      "crossmark-restriction": false
    },
    "short-container-title": [
      "JP"
    ],
    "abstract": "\u003Cjats:p\u003EThe characteristic theme of the works of Stone is the bridge between culture and society. Several narratives concerning the fatal flaw, and subsequent dialectic, of semioticist class may be found. Thus, Debord uses the term ‘the subtextual paradigm of consensus’ to denote a cultural paradox. The subject is interpolated into a neocultural discourse that includes sexuality as a totality. But Marx’s critique of prepatriarchialist nihilism states that consciousness is capable of significance. The main theme of Dietrich’s model of cultural discourse is not construction, but neoconstruction.Thus, any number of narratives concerning the textual paradigm of narrative exist. Pretextual cultural theory suggests that context must come from the collective unconscious.\u003C/jats:p\u003E",
    "DOI": "10.5555/12345678",
    "type": "journal-article",
    "created": {
      "date-parts": [
        [2011, 11, 9]
      ],
      "date-time": "2011-11-09T09:42:05Z",
      "timestamp": 1320831725000
    },
    "update-policy": "https://doi.org/10.5555/something",
    "source": "Crossref",
    "is-referenced-by-count": 11,
    "title": [
      "Toward a Unified Theory of High-Energy Metaphysics: Silly String Theory"
    ],
    "prefix": "10.5555",
    "volume": "1",
    "clinical-trial-number": [
      {
        "clinical-trial-number": "isrctn12345",
        "registry": "10.18810/isrctn"
      },
      {
        "clinical-trial-number": "isrctn1234",
        "registry": "10.18810/isrctn",
        "type": "results"
      },
      {
        "clinical-trial-number": "isrctn9999",
        "registry": "10.18810/isrctn",
        "type": "results"
      }
    ],
    "author": [
      {
        "given": "Josiah",
        "family": "Carberry",
        "sequence": "first",
        "affiliation": []
      }
    ],
    "member": "7822",
    "published-online": {
      "date-parts": [
        [2008, 2, 29]
      ]
    },
    "reference": [
      {
        "key": "1",
        "unstructured": "Dietrich, D. I. ed. (1989) “Deconstructing Modernism: Neocultural discourse in the works of Burroughs.” And/Or Press"
      },
      {
        "key": "2",
        "unstructured": "Humphrey, L. V. F. (1974) “Neocultural discourse and the textual paradigm of narrative.” Loompanics"
      },
      {
        "key": "3",
        "unstructured": "Tilton, R. P. ed. (1985) “Neodialectic Theories: The textual paradigm of narrative and neocultural discourse.”Yale University Press"
      },
      {
        "key": "4",
        "unstructured": "Humphrey, F. P. L. (1974) “Neocultural discourse in the works of Glass.” Panic Button Books"
      },
      {
        "key": "5",
        "unstructured": "de Selby, R. Z. ed. (1992) “Reinventing Surrealism: Neocultural discourse and the textual paradigm of narrative.” Loompanics"
      },
      {
        "key": "6",
        "unstructured": "Hubbard, T. (1978) “The textual paradigm of narrative and neocultural discourse.” Schlangekraft"
      },
      {
        "key": "7",
        "unstructured": "Hamburger, R. J. ed. (1987) “The Stasis of Art: Neocultural discourse, the neocapitalist paradigm of context and nationalism.” Cambridge University Press"
      },
      {
        "key": "8",
        "unstructured": "d’Erlette, W. V. N. (1971) “Neocultural discourse and the textual paradigm of narrative.” O’Reilly & Associates"
      },
      {
        "key": "9",
        "unstructured": "Buxton, G. D. ed. (1993) “The Defining characteristic of Discourse: Neocultural discourse in the works of Gibson.” Harvard University Press"
      },
      {
        "key": "10",
        "unstructured": "Wilson, Q. (1975) “The textual paradigm of narrative and neocultural discourse.” Panic Button Books"
      },
      {
        "key": "11",
        "unstructured": "la Fournier, G. I. ed. (1992) “The Defining characteristic of Sexual identity: Neocultural discourse in the works of Gibson.” University of Illinois Press"
      },
      {
        "key": "12",
        "unstructured": "Finnis, L. Y. K. (1980) “Neocultural discourse and the textual paradigm of narrative.” Cambridge University Press"
      }
    ],
    "updated-by": [
      {
        "updated": {
          "date-parts": [
            [2018, 1, 1]
          ],
          "date-time": "2018-01-01T00:00:00Z",
          "timestamp": 1514764800000
        },
        "DOI": "10.5555/12345678",
        "type": "corrigendum",
        "source": "publisher",
        "label": "Corrigendum"
      },
      {
        "updated": {
          "date-parts": [
            [2009, 9, 14]
          ],
          "date-time": "2009-09-14T00:00:00Z",
          "timestamp": 1252886400000
        },
        "DOI": "10.5555/24242424x",
        "type": "retraction",
        "source": "publisher",
        "label": "Retraction"
      }
    ],
    "container-title": [
      "Journal of Psychoceramics"
    ],
    "original-title": [],
    "deposited": {
      "date-parts": [
        [2025, 11, 3]
      ],
      "date-time": "2025-11-03T06:16:19Z",
      "timestamp": 1762150579000
    },
    "score": 1,
    "resource": {
      "primary": {
        "URL": "https://ojs33.crossref.publicknowledgeproject.org/index.php/test/article/view/2"
      }
    },
    "subtitle": [],
    "short-title": [],
    "issued": {
      "date-parts": [
        [2008, 2, 29]
      ]
    },
    "references-count": 12,
    "journal-issue": {
      "issue": "1",
      "published-online": {
        "date-parts": [
          [2023, 4, 20]
        ]
      }
    },
    "URL": "https://doi.org/10.5555/12345678",
    "relation": {

    },
    "ISSN": [
      "0264-3561"
    ],
    "issn-type": [
      {
        "type": "electronic",
        "value": "0264-3561"
      }
    ],
    "subject": [],
    "published": {
      "date-parts": [
        [2008, 2, 29]
      ]
    },
    "assertion": [
      {
        "URL": "http://orcid.org/0000-0002-1825-0097",
        "order": 0,
        "name": "orcid",
        "label": "ORCID",
        "explanation": {
          "URL": "IDs for Or"
        }
      },
      {
        "value": "2012-07-24",
        "order": 0,
        "name": "received",
        "label": "Received",
        "group": {
          "name": "publication_history",
          "label": "Publication History"
        }
      },
      {
        "value": "2012-08-29",
        "order": 1,
        "name": "accepted",
        "label": "Accepted",
        "group": {
          "name": "publication_history",
          "label": "Publication History"
        }
      },
      {
        "value": "2012-09-26",
        "order": 2,
        "name": "published_online",
        "label": "Published Online",
        "group": {
          "name": "publication_history",
          "label": "Publication History"
        }
      },
      {
        "value": "2012-10-27",
        "order": 3,
        "name": "published_print",
        "label": "Published Print",
        "group": {
          "name": "publication_history",
          "label": "Publication History"
        }
      },
      {
        "URL": "http://psychoceramics.labs.crossref.org/10.5555-12345678.html",
        "order": 0,
        "name": "peer_reviewed",
        "label": "Peer reviewed",
        "explanation": {
          "URL": "thrice"
        },
        "group": {
          "name": "peer_review",
          "label": "Peer review"
        }
      },
      {
        "URL": "http://www.silly-string.com/silly-info/index.cfm",
        "order": 0,
        "name": "supplementary_Material",
        "label": "Supplementary Material",
        "explanation": {
          "URL": "Helpful Silly String resource"
        }
      },
      {
        "URL": "http://psychoceramics.labs.crossref.org/10.5555-12345678.html",
        "order": 0,
        "name": "licensing",
        "label": "Licensing Information",
        "explanation": {
          "URL": "Complicated license information available"
        },
        "group": {
          "name": "copyright_licensing",
          "label": "Copyright & Licensing"
        }
      },
      {
        "URL": "http://psychoceramics.labs.crossref.org/10.5555-12345678.html",
        "order": 1,
        "name": "copyright_statement",
        "label": "Copyright Statement",
        "explanation": {
          "URL": "Lorem Copyrightsum"
        },
        "group": {
          "name": "copyright_licensing",
          "label": "Copyright & Licensing"
        }
      }
    ]
  }
}
```

