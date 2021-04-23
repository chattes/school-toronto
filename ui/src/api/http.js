const makeHttp = (http) => {
  return {
    get: async ({ url, headers = undefined, params = undefined }) => {
      return http.get(url, { headers, params });
    },
    post: async ({ url, body, headers = undefined, params = undefined }) => {
      return http.post(url, body, { headers, params });
    },
  };
};

export default makeHttp;
