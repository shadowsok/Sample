using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TestTrac.Models;
using TestTrac.Models.ViewModels;
using TestTrac.Models.Repositories;
using TestTrac.Common;
using Elmah;
using TestTrac.Common.Logging.NLog;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using TestTrac.Common.CustomAttributes;

namespace TestTrac.Controllers
{
    [NoCache]
    public class RxController : Controller
    {
//#if DEBUG
        //
        // GET: /Rx/
        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult Index()
        {
            return View();
        }

        [ValidateInput(false)]
        [AcceptVerbs(HttpVerbs.Post)]
        [ValidateAntiForgeryToken]
        public ActionResult GetDonorStatus(RxUploadDonorViewModel rxUpload)
        {
            try
            {
                string partialView = "_RxUploadDonorForm";

                if (ModelState.IsValid)
                {

                    IRxUpload rxUploadInfo = new RxUploadRespository();
                    dynamic rxMessage = rxUploadInfo.VerifyDonor(rxUpload);

                    if (rxMessage.showUpload == true)
                    {
                        partialView = "_RxUploadFileForm";
                        RxUploadFileViewModel rxUploadFile = new RxUploadFileViewModel();
                        rxUploadFile.Token = rxMessage.token;
                        return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, partialView, rxUploadFile, this.ViewData, this.TempData), isValid = ModelState.IsValid, rxMessage = rxMessage });
                    }
                    else
                    {
                        return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, partialView, rxUpload, this.ViewData, this.TempData), isValid = ModelState.IsValid, rxMessage = rxMessage });
                    }
                }
                else
                {
                    return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, partialView, rxUpload, this.ViewData, this.TempData), isValid = ModelState.IsValid, rxMessage = "" });
                }
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GetDonorStatus in RxController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        [ValidateAntiForgeryToken]
        public ActionResult UploadRx(RxUploadFileViewModel rxUploadFile)
        {
            try
            {
                string partialView = "_RxUploadFileForm";


                if (ModelState.IsValid)
                {
                    IRxUpload rxUploadFileData = new RxUploadRespository();
                    dynamic rxMessage = rxUploadFileData.UploadRx(rxUploadFile);

                    return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, partialView, rxUploadFile, this.ViewData, this.TempData), isValid = ModelState.IsValid, rxMessage = rxMessage });
                }
                else
                {
                    var errorList = ModelState.Values.SelectMany(m => m.Errors)
                                 .Select(e => e.ErrorMessage)
                                 .ToList();

                    return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, partialView, rxUploadFile, this.ViewData, this.TempData), isValid = ModelState.IsValid, rxMessage = new { showUploadSuccess = false }, rxErrorList = errorList });
                }
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in UploadRx in RxController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

//#endif
    }
}
