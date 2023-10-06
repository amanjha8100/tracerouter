import { error } from "console";
import * as dgram from "dgram";
import * as dns from "dns";
import { resolve } from "path";

//import not working as d.ts (declaration file for typescript is missing in raw-socket package)
// import * as raw from "raw-socket";

const raw = require("raw-socket");

export class socketClient {
    ttl: number;
    url: string;
    ip: string;
    destination_port: number;
    serial_no: number;
    break_flag: boolean;
    timeout: number;
    start_time: any;

    public constructor() {
        // this.socketUDP = dgram.createSocket('udp4');
        // this.socketICMP = raw.createSocket({
        //     protocol: raw.Protocol.ICMP
        // });
        this.ttl = 1;
        this.url = "www.urbanladder.com";
        this.ip = "";
        this.destination_port = 33434;
        this.serial_no = 1;
        this.break_flag = false;
        this.timeout = 3000; //in ms
        this.start_time = [];
    }

    public get IP() {
        return this.ip;
    }

    public set IP(name: string) {
        this.ip = name;
    }

    public get URL() {
        return this.url;
    }

    public set URL(name: string) {
        this.url = name;
    }

    public sendPacketUDP() {
        if(this.ttl > 64) {
            console.log("Exiting because ttl exceeded");
            process.exit(0);
        }

        let socketUDP = dgram.createSocket('udp4');
        socketUDP.bind(() => {
            socketUDP.setTTL(this.ttl);
        });

        let msg = Buffer.from(this.url, "utf8");
        // console.log("Destination Ip: ", this.ip, " port: ", this.destination_port, " ttl: ", this.ttl);
        socketUDP.send(msg, 0, msg.length, this.destination_port, this.ip, (error: any) => {
            if(error) {
                console.log("Packet not sent to destination IP address");
                socketUDP.close();
            } else {
                // console.log("Packet sent, ttl: ", this.ttl, " ip: ", this.ip);
                this.start_time = process.hrtime();
                socketUDP.close();
                //trying to wait for packet to be received
            }
        });
    }

    public hostnameFromIP(ip: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            dns.reverse(ip, (err, hostnames) => {
                if(err) {
                    // console.error(`Reverse DNS lookup failed: ${err.message}`);
                    reject(err);
                }
                resolve(hostnames);
            });
        });
    }


    public listenToPacket(){
        //Refer => https://www.npmjs.com/package/raw-socket
        let socketICMP = raw.createSocket({
            protocol: raw.Protocol.ICMP,
            addressFamily: raw.AddressFamily.IPv4
        });

        socketICMP.on ("message", async (buffer: Buffer, source: string) => {
            // console.log ("received " + buffer.length + " bytes from " + source, " ttl: ", this.ttl);
            let hn: string[] = [];
            let end_time: any = process.hrtime(this.start_time);
            // Calculate the time delay in nanoseconds
            const delayInMilliseconds = (end_time[0] * 1e9 + end_time[1])/1e6;

            if( delayInMilliseconds > this.timeout) {
                this.serial_no = this.serial_no + 1;
                console.log(this.serial_no, " * * * ");
                this.ttl = this.ttl + 1;
                this.sendPacketUDP();
            }
            const message = buffer.toString("hex");
            // console.log(message)
            const offset = 20;
            const messageType = parseInt(message.substr(offset*2, 2), 16);
            const messageCode = parseInt(message.substr(offset*2 + 2, 2), 16);
            // console.log(messageType, " ", messageCode);

            // When a TTL expiry condition is satisfied
            // or when the destination becomes unreachable (also true when reached destination)
            if(source === "1.1.1.1") {
                this.ttl = this.ttl + 1;
                this.sendPacketUDP();
            }

            if(source === this.ip) {
                // console.log("Reached here: ");
                let hn: string[] = [];
                await this.hostnameFromIP(source).then((response) => {
                    hn = response;
                }).catch((error) => {
                    // console.log("Error in resolving hostname")
                    hn.push(source);
                });

                console.log(this.serial_no, " ", source," ( ",hn[0], " ) |", delayInMilliseconds, " ms");
                console.log("Exiting because destination was found");
                process.exit(0);
            }
            // console.log("Message Type: ", messageType, " Message Code: ", messageCode);
            if ((messageType === 11 && messageCode === 0) || (messageType === 3 && messageCode === 3)) {
                // this.ip = source;

                let hn: string[] = [];
                await this.hostnameFromIP(source).then((response) => {
                    hn = response;
                }).catch((error) => {
                    // console.log("Error in resolving hostname")
                    hn.push(source);
                });

                console.log(this.serial_no, " ", source," ( ",hn[0], " ) |", delayInMilliseconds, " ms");
                this.serial_no = this.serial_no + 1;
                this.ttl = this.ttl + 1;
                this.sendPacketUDP();
            }
            // this.ttl = this.ttl + 1;
            // this.sendPacketUDP();
        });

        socketICMP.on('error', (err: string) => {
            console.error(err);
        });
        
        socketICMP.on('close', () => {
            console.log('socket closed');
        });
    }
}