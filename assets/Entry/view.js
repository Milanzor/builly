import io from 'socket.io-client';

// Domready
document.addEventListener("DOMContentLoaded", function () {

    if (window.currentBuilder) {

        var socket = io.connect(window.location.origin);

        // Ask for the builder log
        socket.emit('get-builder-log', {builder_id: window.currentBuilder.id});

        // Log line
        socket.on('builder-log-line', function (logLine) {
            var logP = document.createElement('p');
            logP.innerHTML = logLine.replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/[^a-z0-9 ,.?!%\[\]\/+{}\-<>:;]/ig, '').trim();
            document.getElementById('log').appendChild(logP);
            document.getElementById('log').scrollTo(0, document.getElementById('log').scrollHeight);
        });
    }
});
