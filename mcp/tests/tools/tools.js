export const toolsList = [
  {
    name: "ping_api",
    description: "Pings the Spring Boot API server and returns its pong status.",
    inputSchema: {
      type: "object",
      properties: {
        agentName: {
          type: "string",
          description: "Name of the agent or caller pinging the server"
        }
      },
      required: ["agentName"]
    }
  },
  {
    name: "get_status",
    description: "Checks the current health and runtime status of the Spring Boot API server.",
    inputSchema: {
      type: "object",
      properties: {
        agentName: {
          type: "string",
          description: "Name of the agent or caller checking the server status"
        }
      },
      required: ["agentName"]
    }
  }
];