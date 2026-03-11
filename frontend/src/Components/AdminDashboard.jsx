const AdminDashboard = () => {

  return (
    <div className="container-fluid">

      <h4 className="mb-4 fw-bold">Dashboard</h4>

      {/* ROW 1 */}
      <div className="row g-3">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <h6>Total Hours</h6>
            <h3>-</h3>
            <small className="text-muted">Total hours this week</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <h6>Most Hour Logged Project</h6>
            <h3>-</h3>
            <small className="text-muted">Last Week</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <h6>Most Project Activity</h6>
            <h3>0%</h3>
            <small className="text-muted">Last Week</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3">
            <h6>Today's Activity</h6>
            <h5>No Activity</h5>
            <small className="text-muted">{new Date().toDateString()}</small>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h6>Activity Report (All Projects)</h6>
            <div className="py-5 text-muted">No data found</div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h6>Top Assigned Projects</h6>
            <div className="py-5 text-muted">No data found</div>
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div className="row g-3 mt-3">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h6>Ongoing Tasks</h6>
            <div className="py-5 text-muted">No data found</div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h6>Timesheet (All Projects)</h6>
            <div className="py-5 text-muted">No data found</div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h6>Timesheet (All Projects)</h6>
            <div className="py-5 text-muted">No data found</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h6>Timesheet (All Projects)</h6>
            <div className="py-5 text-muted">No data found</div>
          </div>
        </div><div className="col-md-6">
          <div className="card border-0 shadow-sm p-3 text-center">
            <h6>Timesheet (All Projects)</h6>
            <div className="py-5 text-muted">No data found</div>
          </div>
        </div>
      </div>

    </div>
  );

};

export default AdminDashboard;
