class HfInference {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  endpoint(endpoint) {
    return new HfInferenceEndpoint(endpoint, this.apiKey);
  }
}

class HfInferenceEndpoint {
  constructor(endpoint, apiKey) {
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  async query(data) {
    const response = await fetch(
      this.endpoint,
      {
        headers: { 
          "Accept" : "application/json",
          "Authorization": "Bearer " + this.apiKey,
          "Content-Type": "application/json" 
        },
        method: "POST",
        body: JSON.stringify({
          inputs:"",
          ...data
        }),
      }
    );
    const result = await response.json();
    return result;
  }

}

export const hfCustomApi = {
  HfInference,
}