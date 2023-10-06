import * as dns from 'dns';
import { socketClient } from './socketClient';

class Execute { 
    hops: number
    url: string
    socket: socketClient

    public constructor() {
        this.hops = 64
        // this.url = "www.urbanladder.com";
        this.url = "dns.google.com";
        this.socket = new socketClient();
    }

    public get urlString() {
        return this.url;
    }

    public set urlString(name: string) {
        this.url = name;
    }

    public resolveDnsAddress() {
        // this.dnsResolver.setServers(['198.41.0.4']);

        //resolve used for resolving ipV4 addresses
        dns.resolve(this.url , 'A', (err, value) => { 
            if(err) { 
                console.log(err); 
                return; 
            } 
            // console.log(value); 
            this.socket.IP = value[0];
            this.socket.URL = this.url;
            this.socket.listenToPacket();
            this.socket.sendPacketUDP();
            let bytes = Buffer.from(this.url, "utf-8").length;
            console.log("traceroute to ", this.url, " (",value,"),", this.hops, " hops max,", bytes ,"byte packets" )
            // this.socket.execute(1);
        })
    }

}

// const exe = new Execute();
// exe.resolveDnsAddress();

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter URL: ', (userInput: string) => {
  const exe = new Execute();
  exe.url = userInput;
  exe.resolveDnsAddress();
  rl.close();
});


