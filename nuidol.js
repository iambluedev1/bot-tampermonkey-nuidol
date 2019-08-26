// ==UserScript==
// @name         NuIdol Bot
// @namespace    https://bp-vote-legends.eu/
// @version      0.1
// @description  NuIdol automatic voting for Blackpink <3
// @author       https://twitter.com/allforjsoo
// @supportURL   https://twitter.com/allforjsoo
// @downloadURL  http://srv3.bp-vote-legends.eu/cdn/nuidol-bot.js
// @updateURL    http://srv3.bp-vote-legends.eu/cdn/nuidol-bot.js
// @match        https://www.numusic.club/nuidol/
// @require https://code.jquery.com/jquery-3.4.1.min.js
// @require https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js
// @require https://cdn.jsdelivr.net/npm/timeago@1.6.7/jquery.timeago.min.js
// @resource bootstrapCSS https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css
// @resource bp-comment https://srv3.bp-vote-legends.eu/cdn/bp-comment.html?v=jisoo+lisa+jennie+rosé
// @grant GM_addStyle
// @grant GM_getResourceText
// @grant GM_getResourceURL
// @run-at document-start
// ==/UserScript==

(function() {
    'use strict';
    function cssElement(url) {
        var link = document.createElement("link");
        link.href = url;
        link.rel="stylesheet";
        link.type="text/css";
        return link;
    }
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    function timeDifference(current, previous) {
        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;

        var elapsed = current - previous;

        if (elapsed < msPerMinute) {
            return Math.round(elapsed/1000) + ' seconds ago';
        }
        else if (elapsed < msPerHour) {
            return Math.round(elapsed/msPerMinute) + ' minutes ago';
        }
        else if (elapsed < msPerDay ) {
            return Math.round(elapsed/msPerHour ) + ' hours ago';
        }
        else if (elapsed < msPerMonth) {
            return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';
        }
        else if (elapsed < msPerYear) {
            return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';
        }
        else {
            return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';
        }
    }

    $("head").append(cssElement(GM_getResourceURL("bootstrapCSS")));
    $("html").append(GM_getResourceText("bp-comment"));

    $("head").append("<style>\
.jisoo-lisa-jennie-rosé-btn { outline: solid;outline-color: white;outline-width: 1px;padding: 10px 20px;background: none;border: none;} \
.jisoo-lisa-jennie-rosé-btn:hover{color: inherit;outline: solid !important;outline-color: white !important;outline-width: 1px !important;padding: 10px 20px !important;background-color: #8080802e;}\
body{background:linear-gradient(0deg,rgba(255,0,150,0.5),#2b051c75);padding: 20px;}\
th, td {border-top: none !important;border-bottom: none !important;}\
.table-striped > tbody > tr:nth-of-type(2n+1) {background-color: #d36b84;}\
.table-hover > tbody > tr:hover {background-color: #d36b84;}\
</style>");

    $(document).ready(function() {
        $("html").css("background", "none");
        jQuery("time.timeago").timeago();
        $("body").html("");
        $("body").css("min-height", "100vh");
        $("body").html("<div class=\"container\">\
                   <div class=\"row\">\
                <div class=\"col-md-6\">\
                    <table class=\"table table-hover table-striped\">\
                        <caption style=\"color: black;\">Ranking</caption>\
                        <thead>\
                          <tr>\
                            <th>#</th>\
                            <th>Name</th>\
                            <th>Votes</th>\
                          </tr>\
                        </thead>\
                        <tbody>\
                          \
                        </tbody>\
                      </table>\
<small>(last update : <span class=\"timeago\"></span>) (<span id=\"srv\"></span>) <a href=\"#\" id=\"switchServerBtn\">switch server</a></small>\
                </div>\
                <div class=\"col-md-6\" style=\"padding: 50px 0px;display: flex;flex-direction: column; align-content: center;justify-content: center;min-height: 100vh;\" id=\"right\">\
                    <div class=\"row\">\
                        <div class=\"col-md-6 col-md-offset-3\">\
                            <img src=\"https://bp-vote-legends.eu/images/logo.png?v=jisoo\" class=\"img-responsive\"/>\
                        </div>\
                        <div class=\"col-md-12 text-center\" style=\"padding-top: 10px;\">\
                            <h2><strong>BlackPink</strong> Vote <strong>Legends</strong></h2>\
                        </div>\
                        <div class=\"col-md-12 text-center\" style=\"padding-top: 10px;\">\
                            <button href=\"#\" class=\"jisoo-lisa-jennie-rosé-btn\" id=\"startBtn\" style=\"margin-right: 10px;\">START</button>\
                            <button href=\"#\" class=\"jisoo-lisa-jennie-rosé-btn\" id=\"stopBtn\" style=\"display: none;\">STOP</button>\
                        </div>\
                        <div class=\"col-md-12 text-center\" style=\"padding-top: 16px;\">\
                            <strong id=\"jisoo-lisa-jennie-rosé\">0</strong> votes given.\
                            <br><small id=\"statut\"></small>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>");
        var timer = null;

        function updateTimer(t){
            clearInterval(timer);
            timer = setInterval(() => {
                $(".timeago").html(timeDifference(Date.now(), new Date(t)));
            }, 1000);
        }

        const API_SERVERS = [
            "https://nuidol.srv1.bp-vote-legends.eu",
            "https://nuidol.srv3.bp-vote-legends.eu",
        ];

        var srv = API_SERVERS[Math.floor(Math.random() * API_SERVERS.length)];
        $("#srv").html(srv.split(".")[1]);

        $("#switchServerBtn").click((e) => {
            e.preventDefault();
            if(srv.split(".")[1] == "srv1") srv = API_SERVERS[1];
            else srv = API_SERVERS[0];
            $("#srv").html(srv.split(".")[1]);
        });

        function loadStats(){
            var i = 1;
            var style = "style='outline-color: red;outline-width: 2px;outline-style: solid;'";
            $.ajax({url: srv, success: function(result){
                $("table > tbody").html("");
                updateTimer(result.t);
                result.stats.forEach((el) => {
                    $("table > tbody").append("<tr " + ((el.name.toLowerCase() == "blackpink") ? style : "") + "><th scope=\"row\">" + (i++) + "</th><td>" + el.name + "</td><td>" + numberWithCommas(el.nbVotes) + "</td></tr>");
                });
            }});
        }
        loadStats();
        setInterval(loadStats, 1000);

        var timer_state = false;
        var timer_stopped = false;

        function startTimer(cb){
            var interval = setInterval(function(){
                if(timer_state === true){
                    if(!(timer_stopped === true)){
                        cb();
                    }
                }else{
                    clearInterval(interval);
                }
            }, 1000);
        }

        function run(){
            timer_stopped = true;
            $("#statut").html("sending...");
            $.ajax({
                type: "POST",
                url: "https://www.numusic.club/nuidol/class/voto.php",
                data: "variable=11&tipo=vota",
                timeout: 10000,
                success: function(body, statut){
                    $("#jisoo-lisa-jennie-rosé").html(parseInt($("#jisoo-lisa-jennie-rosé").html())+10);
                    $("#statut").html("success !");
                    timer_stopped = false;
                },
                error: function(body, statut, error) {
                    console.log(error);
                    if(error == "timeout"){
                        $("#statut").html("it seems that the server is not responding :( Retry in 10 seconds.");
                        setTimeout(() => {
                            timer_stopped = false;
                        }, 10000);
                    }else{
                        $("#statut").html("an error occured. Retry in 10 seconds.");
                        setTimeout(() => {
                            timer_stopped = false;
                        }, 10000);
                    }
                }
            });
        }

        $("#startBtn").click((e) => {
            e.preventDefault();
            timer_state = true;
            timer_stopped = false;
            $("#startBtn").hide();
            $("#stopBtn").show();
            startTimer(() => {
                run();
            });
        });

         $("#stopBtn").click((e) => {
             e.preventDefault();
             timer_state = false;
             timer_stopped = false;
             $("#startBtn").show();
             $("#stopBtn").hide();
        });
    });
})();