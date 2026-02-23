import "../styling/ConfigurationStyles.css"

export default function ConfigurationForm(){
    return(
        <div className="container">
            <div className="form-wrapper">
                <h2>Configure Outlet ID and Access Token</h2>

                <form>
                    <div className="form-group">
                        <label htmlFor="outlet_id"id="outlet_id">Outlet ID</label>
                        <input type="numeric" placeholder="Enter Outlet ID"/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="order_url">Preparation Screen URL</label>
                        <input id="outlet_id" placeholder="Preparation Screen URL" readOnly={true}/>
                    </div>

                    <div className="form-group">
                        <label htmlFor="outlet_id">Access Token</label>
                        <input type="text" id="access_token" placeholder="Enter Access Token"/>
                    </div>

                    <input type="submit" value="Configure" />
                </form>
            </div>

        </div>
    );
};