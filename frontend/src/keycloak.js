import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "firstRealm",
  clientId: "my-react-client",
});

export default keycloak;