var React = require('react');
var CounterWidget = require('../components/counter-widget.jsx');
var Panel = require('../components/panel.jsx');
var Chart = require('../components/time-series-chart.jsx');
var GrainMethodTable = require('../components/grain-method-table.jsx');

const ClusterGraph = props => {
    const values = [];
    const timepoints = [];
    Object.keys(props.stats).forEach(key => {
        values.push(props.stats[key]);
        timepoints.push(props.stats[key].period);
    });
    if (!values.length) {
        return null;
    }

    while (values.length < 100) {
        values.unshift({ count: 0, elapsedTime: 0, period: 0, exceptionCount: 0 });
        timepoints.unshift("");
    }
    var series0  = []
    var series1 = []
    var series2 = []
    values.map(z => {
        series0.push(z.exceptionCount),
        series1.push(z.count),
        series2.push((z.count === 0 ? 0 : z.elapsedTime / z.count))
    });
    return <div>
        <Chart
            timepoints={timepoints}
            series={[
                series0,
                series1,
                series2
            ]} />
    </div>;
};

module.exports = class Overview extends React.Component {
    render() {
        var stats = { totalActivationCount: 0, totalSeconds: 0, totalAwaitTime: 0, totalCalls: 0, totalExceptions: 0 };
        this.props.dashboardCounters.simpleGrainStats.forEach(stat => {
            stats.totalActivationCount += stat.activationCount;
            stats.totalSeconds += stat.totalSeconds;
            stats.totalAwaitTime += stat.totalAwaitTime;
            stats.totalCalls += stat.totalCalls;
            stats.totalExceptions += stat.totalExceptions;
        });

        return <div>
            <div className="row">
                <div className="col-md-6">
                    <CounterWidget icon="cubes" counter={stats.totalActivationCount} title="Total Activations" link="#/grains" />
                </div>
                <div className="col-md-6">
                    <CounterWidget icon="database" counter={this.props.dashboardCounters.totalActiveHostCount} title="Active Silos" link="#/silos" />
                </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                  <CounterWidget icon="bug" counter={(stats.totalCalls === 0) ? "0.00" : (100 * stats.totalExceptions / stats.totalCalls).toFixed(2) + "%"} title="Error Rate" />
              </div>
              <div className="col-md-4">
                  <CounterWidget icon="tachometer" counter={(stats.totalCalls / 100).toFixed(2)} title="Req/sec" />
              </div>
              <div className="col-md-4">
                  <CounterWidget icon="clock-o" counter={(stats.totalCalls === 0) ? "0" : (stats.totalAwaitTime / stats.totalCalls).toFixed(2) + "ms"} title="Average response time" />
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Panel title="Cluster Profiling">
                  <div>
                    <span><strong style={{color:"#783988",fontSize:"25px"}}>/</strong> number of requests per second<br/><strong style={{color:"#EC1F1F",fontSize:"25px"}}>/</strong> failed requests</span>
                    <span className="pull-right"><strong style={{color:"#EC971F",fontSize:"25px"}}>/</strong> average latency in milliseconds</span>
                    <ClusterGraph stats={this.props.clusterStats} />
                  </div>
                </Panel>
              </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <Panel title="Methods with Most Calls"><GrainMethodTable values={this.props.grainMethodStats.calls} valueFormatter={x => `${(x.count / x.numberOfSamples).toFixed(2)}req/sec`} /></Panel>
                </div>
                <div className="col-md-4">
                    <Panel title="Methods with Most Exceptions"><GrainMethodTable values={this.props.grainMethodStats.errors} valueFormatter={x => `${(100 * x.exceptionCount / x.count).toFixed(2)}%`} /></Panel>
                </div>
                <div className="col-md-4">
                    <Panel title="Methods with Highest Latency"><GrainMethodTable values={this.props.grainMethodStats.latency} valueFormatter={x => `${(x.elapsedTime / x.count).toFixed(2)}ms/req`} /></Panel>
                </div>

            </div>
        </div>
    }
}
