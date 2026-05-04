# Byd-recharge-station-manipulation-system

To run the hole project you will need to run keycloak, the backend and finally the frontend and make sure that the pore your project opened to is 5074, if you find it opening to 5073 or mothing else try changing where you're opening from is your're on the terminal change to vs code and vice versa or else you'll need to change the keycloak configuration to run on your port.

to run the backend;
  open the terminal inside the demo file then type:
                                      nvm spring-boot:run
                                      
to run keycloak;
  open the terminal inside the keycloak file then type:
                                      bin/kc.sh start-dev
                                      
to run the frontend;
  open the terminal inside the frontend folder then type:
                                      npm install  
                                      npm run dev
