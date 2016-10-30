const Discord = require('discord.js')
const bot = new Discord.Client();
const token = 'MjIxNzEwNjI0NjQ2ODg5NDcy.CsGgHw.P0q4IAtUcx4W_yCkEr2O7QHm6og'

var https = require('https');
var config = require('../sb-config.js');

var lpid = 0;
var lfpid = 0;
var ltid = 0;
var channel = 0;
var started = 0;
var key = config.getKey();

function doProcessForumThreadsAndPosts( data, thechannel ) {
	channel = thechannel;
	try {
		data = JSON.parse( data );
		// Threads
		try {
			if( parseInt( data['t'][0]['id'] ) > ltid ) {
				ltid = parseInt( data['t'][0]['id'] );
			}
			if( parseInt( data['t'][0]['fpid'] ) > lfpid ) {
				lfpid = parseInt( data['t'][0]['fpid'] );
			}
		} catch (e) {  }
		if( ltid > 0) {
				try {
					channel.sendMessage(
						'New thread by ' + data['t'][0]['username'] +
						' (' + data['t'][0]['title'] + ')' +
						' - ' + data['t'][0]['url']
					);
				} catch( e ) {  }
		}
		// Posts

		try {
			if( parseInt( data['p'][0]['id'] ) > lpid ) {
				lpid = parseInt( data['p'][0]['id'] );
			}	
		} catch (e) {; }
		if( lpid > 0 && lfpid != lpid) {
				try {
						channel.sendMessage(
							'New post by ' + data['p'][0]['username'] +
							' in ' + data['p'][0]['title'] +
							' - ' + data['p'][0]['url']
						);
				} catch( e ) {   }
		}
	} catch( e ) { console.log(e);}
}

function doRunForumWatcher() {
    args = key;
	if( lpid > 0 ) {
		args += '&lastpid=' + lpid;
	}
	if( ltid > 0 ) {
		args += '&lasttid=' + ltid;
	}

	https.get({
		host: 'theswarm.net',
		path: '/forumbot.php?' + args,
	}, function( response ) {
		response.on('data', function( data ) {
			doProcessForumThreadsAndPosts( data, channel);
		});
	}).on('error', function(e) {
		console.log(e);
	});
	setTimeout( doRunForumWatcher, 5000 );
}

function checkAdmin (id) {
	if (id == "133334548887896065" || id == "169679605756592128" || id == "132191558412926976") {
		return true;
	} else {
		return false;
	}
}

bot.on('ready', () => {
  console.log("swarmbot is ready!");
})

bot.on('message', message => {
	if (message.content == "%forum-announcer" && checkAdmin(message.author.id)) {
		if (!started) {
			channel = message.channel;
			started = 1;
			message.channel.sendMessage("Forum announcer started.");
			doRunForumWatcher();
		} else {
			message.channel.sendMessage("Forum announcer already started.")
		}
	}
	if (message.content == "%shutdown" && checkAdmin(message.author.id)) {
		message.channel.sendMessage("swarmbot shutting down.");
	    bot.destroy();	
        throw new Error();
	}
});

bot.login(token);
bot.avatarURL = "https://theswarm.net/data/avatars/l/0/1.jpg";
