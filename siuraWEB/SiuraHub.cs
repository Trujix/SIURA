using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace siuraWEB
{
    public class SiuraHub : Hub
    {
        public void PushServidor(string datanotif)
        {
            Clients.All.pushAccion(datanotif);
        }
    }
}