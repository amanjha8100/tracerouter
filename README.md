# Traceroute

## To run the project
```
npm start
```

It will then ask for an input, enter the URL and it will do the rest.

## Output

![Output](https://drive.google.com/uc?export=view&id=1ytpOjlB_ISKIB8YSrqxDRIKdEnPlFAuN)

## Concept

When a data packet is sent from a source to a destination ip address, it goes through a couple of routers in between.
Traceroute is a CMD tool which logs every router in path between a source and the deatination ip address. The concept behind it, is a hack which is being used to generate a message at every router in between. Every data packet when being send has a ttl field (time to live), which in generality is used so that a data packet does not wander around till the end of time, if it fails to reach the destination ip address. Every router in between the path of source and destination is supposed to reduce the ttl field by 1. Now if at any router the ttl field becomes zero, it sends an ICMP time exceeded message which is leveraged by tracerouters to know the router's ip. 

So at every router in path a time exceeded ICMP message is tactically generated and then logged, in the tracerouter tool. To reach further routers in path the ttl field is increased and subsequent UDP packets are sent.