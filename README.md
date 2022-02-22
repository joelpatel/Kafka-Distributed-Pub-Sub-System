# Kafka Distributed Pub/Sub System

For more detailed docs, please read Documentation.pdf file attached with this submission.

APIs used for this phase are ( along with API keys ):
1. https://api.nasa.gov/planetary/apod?api_key=qGtlaG4RHfbMjEmvfh4dEZcWD8YnErOOPjHQkKsu
2. http://api.open-notify.org/astros.json
3. https://api.wheretheiss.at/v1/satellites/25544
Copy and paste them on your browser and you can see the responses.


Instantiating the System

1.> IF there are connection related issues THEN <step 1 depreciated>
        1. uncomment 3 commented lines in docker-compose and comment the above 3 lines for each kafka nodes
        2. replace all the <<your_local_ip>> or 10.84.172.109 from docker-compose file AND replace kafka1, kafka2 and so on from producer (./publisher/app.js) and consumer (./middleware/app.js) files with your device's private IP address.
                > For MACOS, hold the option key and click the WiFi, Ethernet symbol in the menu bar, then copy the IP Address. OR run `ifconfig | grep "inet "` in the terminal and get the non-localhost private IP address. For example, 10.84.172.109
                > For LINUX, use the same command `ifconfig | grep "inet "` and replace with it.
                > For windows, run CMD in admin mode and get the private IP address using `ipconfig` command and replace with it.
                > NOTE: for deploying this, instead of using the private address, it will need the static public address of the system where it’s deployed.
2.> Run `docker-compose up` from the workspace directory. Topics and everything else is set up programmatically. So no need to run shell scripts provided by Kafka to create topics.
3.> Now open http://localhost:3000
4.> Create a user.
5.> Subscribe to events listed in the Topics tab.
6.> View your subscriptions in the Subscriptions navigation tab.
7.> View live incoming notifications in the Notifications tab.

To interact with Kafka brokers, use Docker’s exec commands.

That’s it. The main critical part is the IP address setup for instantiating the system.
