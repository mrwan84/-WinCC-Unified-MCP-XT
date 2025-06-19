export const graphqlQueryBrowse = `
      query BrowseObjects(
        $nameFilters: [String],
        $objectTypeFilters: [ObjectTypesEnum],
        $baseTypeFilters: [String],
        $language: String
      ) {
        browse(
          nameFilters: $nameFilters,
          objectTypeFilters: $objectTypeFilters,
          baseTypeFilters: $baseTypeFilters,
          language: $language
        ) {
          name
          displayName
          objectType
          dataType
        }
      }
    `;

export const graphqlQueryTagValues = `
          query GetTagValues($names: [String!]!, $directRead: Boolean) {
            tagValues(names: $names, directRead: $directRead) {
              name
              value {
                value
                timestamp
                quality {
                  quality
                  subStatus
                  limit
                  extendedSubStatus
                  sourceQuality
                  sourceTime
                  timeCorrected
                }
              }
              error {
                code
                description
              }
            }
          }
        `;
export const graphqlQueryLoggedTagValues = `
      query GetLoggedTagValues(
        $names: [String]!,
        $startTime: Timestamp,
        $endTime: Timestamp,
        $maxNumberOfValues: Int,
        $sortingMode: LoggedTagValuesSortingModeEnum,
        $boundingValuesMode: LoggedTagValuesBoundingModeEnum
      ) {
        loggedTagValues(
          names: $names,
          startTime: $startTime,
          endTime: $endTime,
          maxNumberOfValues: $maxNumberOfValues,
          sortingMode: $sortingMode,
          boundingValuesMode: $boundingValuesMode
        ) {
          loggingTagName
          error {
            code
            description
          }
          values {
            # We only need the direct value and timestamp from the nested Value object
            value {
              value
              timestamp
            }
          }
        }
      }
    `;
export const graphqlQueryActiveAlarms = `
      query GetActiveAlarms(
        $systemNames: [String],
        $filterString: String,
        $filterLanguage: String,
        $languages: [String]
      ) {
        activeAlarms(
          systemNames: $systemNames,
          filterString: $filterString,
          filterLanguage: $filterLanguage,
          languages: $languages
        ) {
          name
          instanceID
          raiseTime
          acknowledgmentTime
          clearTime
          modificationTime
          state
          priority
          eventText
          infoText
          languages # To know the order of multilingual texts
          # Add other ActiveAlarm fields as needed
        }
      }
    `;

export const graphqlQueryLoggedAlarms = `
      query GetLoggedAlarms(
        $systemNames: [String],
        $filterString: String,
        $filterLanguage: String,
        $languages: [String],
        $startTime: Timestamp,
        $endTime: Timestamp,
        $maxNumberOfResults: Int
      ) {
        loggedAlarms(
          systemNames: $systemNames,
          filterString: $filterString,
          filterLanguage: $filterLanguage,
          languages: $languages,
          startTime: $startTime,
          endTime: $endTime,
          maxNumberOfResults: $maxNumberOfResults
        ) {
          name
          instanceID
          raiseTime
          acknowledgmentTime
          clearTime
          resetTime
          modificationTime
          state
          priority
          eventText
          infoText
          languages
        }
      }
    `;
export const graphqlMutationTagValues = `
      mutation WriteTagValues(
        $input: [TagValueInput]!,
        $timestamp: Timestamp,
        $quality: QualityInput
      ) {
        writeTagValues(
          input: $input,
          timestamp: $timestamp,
          quality: $quality
        ) {
          name
          error {
            code
            description
          }
        }
      }
    `;
export const graphqlMutationAcknowledgeAlarms = `
      mutation AcknowledgeAlarms($input: [AlarmIdentifierInput]!) {
        acknowledgeAlarms(input: $input) {
          alarmName
          alarmInstanceID
          error {
            code
            description
          }
        }
      }
    `;
export const graphqlMutationResetAlarms = `
      mutation ResetAlarms($input: [AlarmIdentifierInput]!) {
        resetAlarms(input: $input) {
          alarmName
          alarmInstanceID
          error {
            code
            description
          }
        }
      }
    `;
