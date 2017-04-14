/* Magic Mirror
 * Module: MMM-EFA-departures
 *
 * By gefangenimnetz / https://github.com/gefangenimnetz/MMM-EFA-departures
 * MIT Licensed.
 * 
 * v0.0.1
 */

Module.register("MMM-EFA-departures", {

    defaults: {
        efaUrl: "http://efa.vrr.de/vrr/XSLT_DM_REQUEST",
        stopID: "20019039",
        stopName: "Loading station name …",
        lines: ['all'],
        maxDepartures: 7,
        reload: 1 * 60 * 1000,
        toggleDepTime: true,
        toggleDepTimePerReload: 6, //Every 10 seconds
        fade: true,
        fadePoint: 0.25 // Start on 1/4th of the list.
    },

    start: function () {
        var self = this;
        Log.info("Starting module: " + this.name);
        this.sendSocketNotification("CONFIG", this.config);
        setInterval(function () {
            self.sendSocketNotification("CONFIG", self.config);
        }, this.config.reload);

        moment.updateLocale('de', {
            relativeTime: {
                future: 'in %s',
                past: 'vor %s',
                s: 'ein paar Sek.',
                m: '1 Min.',
                mm: '%d Min.',
                h: '1 Std.',
                hh: '%d Std.',
                d: '1 Tag',
                dd: '%d Tagen',
                M: '1 Mon.',
                MM: '%s Mon.',
                y: '1 Jahr',
                yy: '%s Jahren'
            }
        });
    },

    getStyles: function () {
        return ["MMM-EFA-departures.css"];
    },

    getScripts: function () {
        return ["moment.js", "classie.js"];
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "TRAMS" + this.config.stopID) {
            this.efa_data = payload;
            this.config.stopName = payload.departureList[0].stopName;
            this.updateDom();
        }
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        var header = document.createElement("header");
        header.innerHTML = this.config.stopName;
        wrapper.appendChild(header);

        if (!this.efa_data) {
            var text = document.createElement("div");
            //text.innerHTML = this.translate("LOADING");
            text.innerHTML = "LOADING";
            wrapper.appendChild(text);
        } else {
            var departuresTable = document.createElement("table");
            departuresTable.classList.add("small", "table");
            departuresTable.border = '0';

            var departures = this.efa_data.departureList;

            if (this.config.toggleDepTime) {
                window.clearInterval(this.toggleTimeInt);
                this.toggleTimeInt = window.setInterval(function () {
                    classie.toggle(departuresTable, 'departures__departure--show-time');
                }, (this.config.reload / this.config.toggleDepTimePerReload));
            }

            for (var d in departures) {

                var departureRow = this.createDataRow(departures[d]);

                if (this.config.fade && this.config.fadePoint < 1) {
                    if (this.config.fadePoint < 0) {
                        this.config.fadePoint = 0;
                    }
                    var startingPoint = departures.length * this.config.fadePoint;
                    var steps = departures.length - startingPoint;
                    if (d >= startingPoint) {
                        var currentStep = d - startingPoint;
                        departureRow.style.opacity = 1 - (1 / steps * currentStep);
                    }
                }

                departuresTable.appendChild(departureRow);

            }
            wrapper.appendChild(departuresTable);
        }
        return wrapper;
    },

    createDataRow: function (data) {

        var row = document.createElement("tr");

        var line = document.createElement("td");
        line.className = "departures__departure__line";
        line.innerHTML = '<span class="departures__departure__line__number xsmall">' + data.servingLine.number + '</span>';
        row.appendChild(line);

        var destination = document.createElement("td");
        destination.innerHTML = '<span class="departures__departure__direction small">' + data.servingLine.direction;
        +'</span>';
        row.appendChild(destination);

        var departureTime = new Date(data.dateTime.year, data.dateTime.month - 1, data.dateTime.day, data.dateTime.hour, data.dateTime.minute, 0);
        var departure = document.createElement("td");
        departure.className = "departures__departure";
        departure.innerHTML = '<span class="departures__departure__time-relative small bright">' + moment(departureTime).fromNow() + '</span><span class="departures__departure__time-clock small bright">' + moment(departureTime).format('HH:mm') + '</span>';

        row.appendChild(departure);

        return row;
    }
});
