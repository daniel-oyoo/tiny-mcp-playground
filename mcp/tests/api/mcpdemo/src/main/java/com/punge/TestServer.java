package com.punge;

import java.time.Instant;
import java.util.Map;
import java.util.logging.Logger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication 
public class TestServer{

    private final static Logger log = Logger.getLogger(TestServer.class.getClass().getName());
    public static void main(String[] args) {
        System.out.println("Hello world!");
        SpringApplication.run(TestServer.class,args);
    }

    @RestController 
    public static class TestController{
    @GetMapping("/ping")
    public Map<String,Object> ping(@RequestHeader("X-Agent-Name") String agentName){
       log.info("PINGED BY {} " + agentName);
       return Map.of("status","pong","pingedBy",agentName);
    }

    @GetMapping("/status")
    public Map<String, Object> status(@RequestHeader(value = "X-Agent-Name", defaultValue = "unknown") String agentName) {
    log.info("STATUS CHECKED BY {} " + agentName);
    return Map.of(
        "service", "mcp-test-server",
        "status", "UP",
        "checkedBy", agentName,
        "timestamp", Instant.now().toString()
    );
    }
    }
}