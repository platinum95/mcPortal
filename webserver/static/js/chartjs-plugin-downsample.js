/* chartjs-plugin-downsample | AlbinoDrought | MIT License | https://github.com/AlbinoDrought/chartjs-plugin-downsample/blob/master/LICENSE | Based on flot-downsample, https://github.com/sveinn-steinarsson/flot-downsample/ */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;

var helpers = Chart.helpers;

var defaultOptions = {
    enabled: false,

    // max number of points to display per dataset
    threshold: 1000,

    // if true, downsamples data automatically every update
    auto: true,
    // if true, downsamples data when the chart is initialized
    onInit: true,

    // if true, replaces the downsampled data with the original data after each update
    restoreOriginalData: true,
    // if true, downsamples original data instead of data
    preferOriginalData: false,

};

var floor = Math.floor,
    abs = Math.abs;


function downsampleNumber( data, threshold, labels ) {
    var dataLength = data.length;
    if( threshold >= dataLength || threshold <= 0 ) {
        return [ data, labels ];
    }
    var sampled = [],
        sampledLabels = [],
        sampledIndex = 0;

    var every = ( dataLength - 2 ) / ( threshold - 2 );

    var a = 0,
        maxAreaPoint,
        maxAreaLabel,
        maxArea,
        area,
        nextA;
    
    sampled[ sampledIndex ] = data[ a ]
    sampledLabels[ sampledIndex++ ] = labels[ a ]

    for ( var i = 0; i < threshold - 2; i++ ) {
        var avgY = 0,
            avgX = 0,
            avgRangeStart = floor( ( i + 1 ) * every ) + 1,
            avgRangeEnd = floor( ( i + 2 ) * every ) + 1;
        avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

        var avgRangeLength = avgRangeEnd - avgRangeStart;

        for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
            avgX += avgRangeStart * 1; // * 1 enforces Number (value may be Date)
            avgY += data[avgRangeStart] * 1;
        }
        avgX /= avgRangeLength;
        avgY /= avgRangeLength;

        // Get the range for this bucket
        var rangeOffs = floor((i + 0) * every) + 1,
            rangeTo = floor((i + 1) * every) + 1;

        // Point a
        var pointAY = data[ a ] * 1;

        maxArea = area = -1;

        xRangeLength = abs( a - rangeOffs );

        for (; rangeOffs < rangeTo; rangeOffs++) {
            // Calculate triangle area over three buckets
            area = abs(( a - avgX ) * ( data[ rangeOffs ] - pointAY ) -
                    ( xRangeLength ) * ( avgY - pointAY )
                ) * 0.5;
            if (area > maxArea) {
                maxArea = area;
                maxAreaPoint = data[ rangeOffs ];
                maxAreaLabel = labels[ rangeOffs ];
                nextA = rangeOffs; // Next a is this b
            }
        }

        sampled[ sampledIndex ] = maxAreaPoint; // Pick this point from the bucket
        sampledLabels[ sampledIndex++ ] = maxAreaLabel;
        a = nextA; // This a is the next a (chosen b)
    }

    sampled[ sampledIndex ] = data[ dataLength - 1 ]; // Always add last
    sampledLabels[ sampledIndex ] = labels[ dataLength - 1 ];

    return [ sampled, sampledLabels ];

}

function downsample(data, threshold) {
    // this function is from flot-downsample (MIT), with modifications

    var dataLength = data.length;
    if (threshold >= dataLength || threshold <= 0) {
        return data; // nothing to do
    }

    var sampled = [],
        sampledIndex = 0;

    // bucket size, leave room for start and end data points
    var every = (dataLength - 2) / (threshold - 2);

    var a = 0,  // initially a is the first point in the triangle
        maxAreaPoint,
        maxArea,
        area,
        nextA;

    // always add the first point
    sampled[sampledIndex++] = data[a];

    for (var i = 0; i < threshold - 2; i++) {
        // Calculate point average for next bucket (containing c)
        var avgX = 0,
            avgY = 0,
            avgRangeStart = floor(( i + 1 ) * every) + 1,
            avgRangeEnd = floor(( i + 2 ) * every) + 1;
        avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

        var avgRangeLength = avgRangeEnd - avgRangeStart;

        for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
            avgX += data[avgRangeStart].x * 1; // * 1 enforces Number (value may be Date)
            avgY += data[avgRangeStart].y * 1;
        }
        avgX /= avgRangeLength;
        avgY /= avgRangeLength;

        // Get the range for this bucket
        var rangeOffs = floor((i + 0) * every) + 1,
            rangeTo = floor((i + 1) * every) + 1;

        // Point a
        var pointAX = data[a].x * 1, // enforce Number (value may be Date)
            pointAY = data[a].y * 1;

        maxArea = area = -1;

        for (; rangeOffs < rangeTo; rangeOffs++) {
            // Calculate triangle area over three buckets
            area = abs(( pointAX - avgX ) * ( data[rangeOffs].y - pointAY ) -
                    ( pointAX - data[rangeOffs].x ) * ( avgY - pointAY )
                ) * 0.5;
            if (area > maxArea) {
                maxArea = area;
                maxAreaPoint = data[rangeOffs];
                nextA = rangeOffs; // Next a is this b
            }
        }

        sampled[sampledIndex++] = maxAreaPoint; // Pick this point from the bucket
        a = nextA; // This a is the next a (chosen b)
    }

    sampled[sampledIndex] = data[dataLength - 1]; // Always add last

    return sampled;
}

function getOptions(chartInstance) {
    return chartInstance.options.downsample;
}

function downsampleChart(chartInstance) {
    var options = getOptions(chartInstance),
        threshold = options.threshold;
    if(!options.enabled) return;

    var datasets = chartInstance.data.datasets;
    var labels = chartInstance.config.data.labels;
    chartInstance.originalLabels = labels;
    for(var i = 0; i < datasets.length; i++) {
        var dataset = datasets[i];

        var dataToDownsample = null;
        if(options.preferOriginalData) {
            dataToDownsample = dataset.originalData;
        }
        dataToDownsample = dataToDownsample || dataset.data;

        dataset.originalData = dataToDownsample;
        dataNLabels = downsampleNumber( dataToDownsample, threshold, labels );
        dataset.data = dataNLabels[ 0 ];
        chartInstance.config.data.labels = dataNLabels[ 1 ];
    }
}

var downsamplePlugin = {
    beforeInit: function (chartInstance) {
        var options = chartInstance.options.downsample = helpers.extend({}, defaultOptions, chartInstance.options.downsample || {});

        if(options.onInit) {
            downsampleChart(chartInstance);
        }

        // allow manual downsample-triggering with chartInstance.downsample();
        chartInstance.downsample = function(threshold) {
            if(typeof(threshold) !== 'undefined') {
                chartInstance.options.downsample.threshold = threshold;
            }

            downsampleChart(chartInstance);
        }
    },

    beforeDatasetsUpdate: function(chartInstance) {
        if(chartInstance.options.downsample.auto) {
            downsampleChart(chartInstance);
        }
    },

    afterDatasetsUpdate: function(chartInstance) {
        var options = getOptions(chartInstance);
        if(!options.enabled || !options.restoreOriginalData) return;

        var datasets = chartInstance.data.datasets;
        for(var i = 0; i < datasets.length; i++) {
            var dataset = datasets[i];

            dataset.data = dataset.originalData || dataset.data;
            dataset.originalData = null;
        }
    }
};

module.exports = downsamplePlugin;
Chart.pluginService.register(downsamplePlugin);
},{"chart.js":1}]},{},[2]);
