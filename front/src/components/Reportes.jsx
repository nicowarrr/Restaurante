import 'chart.js/auto';

const ReportesBI = () => {

  return (
    <div className="container mt-5">
      <h2 className="text-center">Reportes del Restaurante</h2>

      
      <div className="row mt-4">
        <div className="col-md-12">
          <h4 className="text-center">Panel de Power BI</h4>
          <iframe 
            title="Power BI Report"
            width="100%"
            height="600px"
            src="https://app.powerbi.com/reportEmbed?reportId=55143b3e-65e7-4d95-ad59-cc7f3321c3da&autoAuth=true&ctid=38a1e0a1-b6b1-42e9-b3a9-597626670b17"
            allowFullScreen>
          </iframe>
        </div>
      </div>
      </div>
  );
};

export default ReportesBI;
