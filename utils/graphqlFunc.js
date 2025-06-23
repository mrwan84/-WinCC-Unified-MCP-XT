// ------------------------------------------------------------------------------------------------------------------------------------------------
// Function to log in a user to WinCC Unified
// ------------------------------------------------------------------------------------------------------------------------------------------------
export const logon = async (graphQL_URL, username, password) => {
  const graphqlMutation = `
      mutation LoginUser($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          token
          expires
          user {
            id
            name
            fullName
            language
          }
          error {
            code
            description
          }
        }
      }
    `;

  const variables = {
    username,
    password,
  };

  console.log(
    `logon || WinCC Unified: login  ${graphQL_URL} || user: ${username}`
  );

  const response = await fetch(graphQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: graphqlMutation,
      variables: variables,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `logon || WinCC Unified: login failed  ${response.status}: ${errorBody}`
    );
  }

  const jsonResponse = await response.json();

  if (jsonResponse.errors) {
    console.error("logon || WinCC Unified: login errors");
  }

  if (!jsonResponse.data.login.token) {
    console.error("logon || WinCC Unified: login missing token ");
  }

  let authInfos = {};
  authInfos.user = username;
  authInfos.pwd = password;
  authInfos.token = jsonResponse.data.login.token;

  return authInfos;
};
// ------------------------------------------------------------------------------------------------------------------------------------------------
// send request function
// ------------------------------------------------------------------------------------------------------------------------------------------------
export const sendReq = async (
  graphQL_URL,
  authInfos,
  graphqlQuery,
  variables
) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (authInfos?.token) {
      headers["Authorization"] = `Bearer ${authInfos.token}`;
    }

    const response = await fetch(graphQL_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `send request || GraphQL request failed with status ${response.status}: ${errorBody}`
      );
      
    }

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
      console.error(
        "send request || GraphQL errors:",
        JSON.stringify(jsonResponse.errors, null, 2)
      );
    }

    if (!jsonResponse.data) {
      console.error(
        "send request || GraphQL response missing data:",
        JSON.stringify(jsonResponse, null, 2)
      );
    }
    return jsonResponse.data;
  } catch (error) {}
};
