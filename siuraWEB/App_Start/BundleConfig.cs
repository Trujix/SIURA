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
                      "~/Content/bootstrap.min.css",
                      "~/CalendarioUI/css/styles.css",
                      "~/CalendarioUI/css/fullcalendar.css",
                      "~/iconos//css/all.css",
                      "~/Content/pnotify.min.css",
                      "~/Content/pnotify.css",
                      "~/Content/loader.css",
                      "~/Content/toggle.min.css",
                      "~/Content/offcanvas.css"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.min.js",
                      "~/CalendarioUI/js/moment.min.js",
                      "~/CalendarioUI/js/fullcalendar.min.js",
                      "~/CalendarioUI/js/locale/es.js",
                      "~/Scripts/pnotify.min.js",
                      "~/Scripts/pnotify.js",
                      "~/Scripts/toggle.min.js",
                      "~/Scripts/loader.js",
                      "~/Scripts/miscelaneas.js",
                      "~/Scripts/index.js",
                      "~/Scripts/dinamicos.js",
                      "~/Scripts/login.js",
                      "~/Scripts/configuracion.js",
                      "~/Scripts/documentacion.js",
                      "~/Scripts/administracion.js"));
        }
    }
}
