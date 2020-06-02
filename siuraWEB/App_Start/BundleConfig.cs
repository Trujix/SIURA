using System.Web;
using System.Web.Optimization;

namespace siuraWEB
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/JQueryUI/jquery-ui.css",
                      "~/Content/bootstrap.min.css",
                      "~/CalendarioUI/css/styles.css",
                      "~/CalendarioUI/css/fullcalendar.css",
                      "~/Content/dataTables.bootstrap4.min.css",
                      "~/iconos/css/all.css",
                      "~/Content/pnotify.min.css",
                      "~/Content/pnotify.css",
                      "~/Content/loader.css",
                      "~/Content/toggle.min.css",
                      "~/Content/chosen.css",
                      "~/Content/offcanvas.css"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.min.js",
                      "~/Scripts/popper.min.js",
                      "~/JQueryUI/jquery-ui.js",
                      "~/CalendarioUI/js/moment.min.js",
                      "~/CalendarioUI/js/fullcalendar.min.js",
                      "~/CalendarioUI/js/locale/es.js",
                      "~/Scripts/jquery.dataTables.min.js",
                      "~/Scripts/dataTables.bootstrap4.min.js",
                      "~/Scripts/canvasImagen.js",
                      "~/Scripts/html2canvas.js.map",
                      "~/Scripts/pnotify.min.js",
                      "~/Scripts/pnotify.js",
                      "~/Scripts/toggle.min.js",
                      "~/Scripts/chosen.js",
                      "~/Scripts/loader.js",
                      "~/pdflib/build/vfs_fonts.js",
                      "~/pdflib/build/pdfmake.min.js",
                      "~/Scripts/jquery.signalR-2.4.1.min.js",
                      "~/Scripts/miscelaneas.js",
                      "~/Scripts/impresiones.js",
                      "~/Scripts/index.js",
                      "~/Scripts/dinamicos.js",
                      "~/Scripts/login.js",
                      "~/Scripts/configuracion.js",
                      "~/Scripts/documentacion.js",
                      "~/Scripts/administracion.js",
                      "~/Scripts/cdeportiva.js",
                      "~/Scripts/cmedica.js",
                      "~/Scripts/cpsicologica.js",
                      "~/Scripts/cconsejeria.js"));
        }
    }
}
