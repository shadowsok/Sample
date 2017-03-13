using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Xml.Serialization;
using Elmah;
using TestTrac.Models;
using TestTrac.Models.Repositories;
using TestTrac.Models.ViewModels;
using TestTrac.Common;
using TestTrac.Common.CustomAttributes;
using TestTrac.Common.Logging.NLog;
using AutoMapper;

namespace TestTrac.Controllers
{
    [SessionExpiryCheck]
    [AjaxAuthorize]
    [Authorize(Roles = "User, Admin")]
    [NoCache]
    public class ECCFOrderController : Controller
    {
        
        //[HttpPost]
        ////[ValidateAntiForgeryToken]
        //public ActionResult VerifyConfirmationNumber(string TestTracConfirmationNumber)
        //{
        //    try { return Json(new { success = (Utility.VerifyConfirmNumber(TestTracConfirmationNumber)) }); }
        //    catch (Exception e)
        //    {
        //        Utility.Log(NLogLogger.LogLevel.Error, "Error in post VerifyConfirmationNumber normally returns json", GetType().FullName, e);
        //        ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
        //        return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
        //    }

        //}

        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult GetLabAcctTestCodes(string accountNumber, string labId)
        {
            try
            {
                ILabAccountNumberTestCodes labAcctNumTestCodeRepository = new LabAccountNumberTestCodeRepository();

                return Json(labAcctNumTestCodeRepository.GetLabAcctNumTestCodesObj(accountNumber, labId), JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GetLabAcctTestCodes normally returns json", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult GetClientAccts(string clientId, string labId, bool subAccount)
        {
            try
            {
                IClientAccounts clientAcctRepository = new ClientAccountRepository();

                if (String.IsNullOrEmpty(labId)) return Json(null, JsonRequestBehavior.AllowGet);

                if (String.IsNullOrEmpty(clientId) && !subAccount)
                {
                    if (!String.IsNullOrEmpty(SessionData.CompanyId))
                    {
                        clientId = SessionData.CompanyId;
                    }
                    else
                    {
                        return Json(null, JsonRequestBehavior.AllowGet);
                    }
                }
                else if (String.IsNullOrEmpty(clientId) && subAccount)
                {
                    return Json(null, JsonRequestBehavior.AllowGet);
                }

                return Json(clientAcctRepository.GetClientAcctsWithLabsObj(clientId, labId, subAccount), JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GetClientAccts normally returns json", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        // Get ClientAcctNum object from clientid and labid. 

        [AcceptVerbs(HttpVerbs.Get)]
        public ActionResult GetClientAcctNums(string clientId, string labId)
        {
            try
            {
                IClientAccountNumber clientAcctNumRepository = new ClientAccountNumberRepository();

                if (clientId.Length != 0)
                {   // Returns json object of lab specific list of SAP account numbers registered to the client
                    return Json(clientAcctNumRepository.GetClientAcctNumsObj(clientId, labId), JsonRequestBehavior.AllowGet);
                }
                else
                {
                    return Json(null, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GetClientAcctNums normally returns json", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        // Get CollectionSiteList object from string of comma delimited zip codes
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetCollSitesByAddress(string lab, string city = "", string state = "", string zip = "")
        {
            try
            {
                // Create new repository object that will be used to retrieve data from the Test Trac webservice
                ICollectionSite collectionSite = new CollectionSiteRepository();

                // Create new criterion object to store criteria in
                CollectionSiteCriterion collSiteCriterion = new CollectionSiteCriterion();

                // Add each criteria to the criterion object
                collSiteCriterion.Add(new CollectionSiteCriteria { City = city, State = state, Zip = zip });

                // Return Json object of the collectionsitelist object that was returned from the repository 
                return Json(new { siteInfo = new { data = collectionSite.GetCollectionSiteList(lab, collSiteCriterion) }, success = "true" });
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in post GetCollSitesByAddress normally returns json", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }


        // Get CollectionSiteList object from string of comma delimited zip codes
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetCollSitesByZip(string lab, string zipCodes)
        {
            try
            {
                // Create new repository object that will be used to retrieve data from the Test Trac webservice
                ICollectionSite collectionSite = new CollectionSiteRepository();

                // Create new criterion object to store criteria in
                CollectionSiteCriterion collSiteCriterion = new CollectionSiteCriterion();

                // Split zipCodeList string on the comma delimiter then add each zip code to a new collection site critera object
                string[] zipCodeList = zipCodes.Split(',');
                foreach (string zipCode in zipCodeList)
                {
                    // Add each criteria to the criterion object
                    collSiteCriterion.Add(new CollectionSiteCriteria { City = "", State = "", Zip = zipCode });
                }

                // Return Json object of the collectionsitelist object that was returned from the repository 
                return Json(new { siteInfo = new { data = collectionSite.GetCollectionSiteList(lab, collSiteCriterion) }, success = "true" });
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in post GetCollSitesByZip normally returns json", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetPartialViewECCFListTable(string lastNDays = "30")
        {
            try
            {
                ECCFOrderCriterion eccfOrderCriterion = new ECCFOrderCriterion();

                IECCFOrder eccfOrder = new ECCFOrderRepository();

                ECCFOrderList eccfOrderList = eccfOrder.GetECCFOrderList(LastNDays: lastNDays);

                List<ECCFOrderListItem> list = eccfOrderList.ECCFOrderCollection.Cast<ECCFOrderListItem>().ToList();

                return PartialView("_ECCFOrderListTable", list);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in post GetPartialViewECCFListTable", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [ValidateAntiForgeryToken]
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetPartialViewECCFOrderListItem(string orderConfirmationNum)
        {
            ECCFOrderCriterion eccfOrderCriterion = new ECCFOrderCriterion();
            IECCFOrder eccfOrder = new ECCFOrderRepository();

            try
            {

                //if (!UserIsAuthorized())
                //    return new HttpStatusCodeResult(401, "Custom Error Message 1"); // Unauthorized
                if (!ModelState.IsValid)
                    return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request

                ECCFOrderListItem eccfOrderListItem = eccfOrder.GetECCFOrderListItem(OrderConfirmationNumber: orderConfirmationNum);

                return PartialView("_ECCFOrderModalConfirmation", eccfOrderListItem);

            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GetPartialViewECCFOrderListItem in ECCFOrderController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        //
        // GET: /ECCFOrder/
        public ActionResult Index(string Filter = "",string OrderConfirmation = "", string e="")
        {
            ECCFOrderCriterion eccfOrderCriterion = new ECCFOrderCriterion();
            IECCFOrder eccfOrder = new ECCFOrderRepository();

            try
            {
                ECCFOrderList eccfOrderList = eccfOrder.GetECCFOrderList(LastNDays: "30");
                List<ECCFOrderListItem> list = eccfOrderList.ECCFOrderCollection.Cast<ECCFOrderListItem>().ToList();

                ViewBag.Filter = Filter;
                ViewBag.EditMessage = Utility.ECCFOrdersActionMessage(OrderConfirmation, "DELETED", e);
                ViewBag.EditValue = e;

                return View(list);
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex);
                // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Index in ECCFOrderController", GetType().FullName, ex);
                Response.StatusCode = 400;
                ModelState.AddModelError(string.Empty, "An error occured while displaying the page.");
                return View(new List<ECCFOrderListItem>());
            }
        }

        //
        // GET: /ECCFOrder/Details/5

        public ActionResult Details(string id, string e = "")
        {
            try
            {
                if (Utility.VerifyConfirmNumber(id))
                {
                    IECCFCollection eccfCollection = new ECCFCollectionRepository();

                    ECCFCollectionListItem eccfCollectionListItem = eccfCollection.GetECCFCollectionListItem(id);

                    if (eccfCollectionListItem == null)
                    { return RedirectToAction("Index", "Dashboard"); }

                    ViewBag.EditMessage = Utility.ECCFOrdersActionMessage(id, "EDIT", e);
                    ViewBag.EditValue = e;

                    return View(eccfCollectionListItem);
                }
                else
                {
                    return RedirectToAction("Index", "Dashboard");
                }
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Details in ECCFOrderController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        //
        // GET: /ECCFOrder/Create
        public ActionResult Create()
        {
            try
            {
                return RedirectToAction("CreateWizard", "ECCFOrder");
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in /ECCFOrder/Create in ECCFOrderController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        // GET: /ECCFOrder/Create
        public ActionResult CreateWizard()
        {
            CreateECCFOrderWizardViewModel eccfWizard = new CreateECCFOrderWizardViewModel();

            try
            {
                return View(eccfWizard);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error  in CreateWizard in ECCFOrderController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                //return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                return View(eccfWizard);
            }
            //catch
            //{
            //    return View(eccfWizard);
            //}
        }

        [AcceptVerbs(HttpVerbs.Post)]
        [ValidateAntiForgeryToken]
        public ActionResult CreateWizardStep1(CreateECCFOrderStep1ViewModel eccfStep1)
        {
            try
            {
                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFOrderStep1", eccfStep1, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error  in CreateWizardStep1 in ECCFOrderController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateWizardStep2(CreateECCFOrderStep2ViewModel eccfStep2)
        {
            try
            {
                eccfStep2 = ECCFOrderRepository.RebuildStep2Collections(eccfStep2);

                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFOrderStep2", eccfStep2, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error  in CreateWizardStep2 in ECCFOrderController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateWizardStep3(CreateECCFOrderStep3ViewModel eccfStep3)
        {
            try
            {
                //eccfStep3.TestCodeDescription = TestCodeDescription;
                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFOrderStep3", eccfStep3, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error  in CreateWizardStep3 in ECCFOrderController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        // Wizard confirmation step
        [HttpPost]
        public ActionResult CreateWizardStep4(CreateECCFOrderStep1ViewModel eccfStep1, CreateECCFOrderStep2ViewModel eccfStep2, CreateECCFOrderStep3ViewModel eccfStep3)
        {
            try
            {
                CreateECCFOrderWizardViewModel eccfWizard = new CreateECCFOrderWizardViewModel();

                if (eccfStep1 != null)
                {
                    eccfWizard.Step1 = eccfStep1;
                }

                if (eccfStep2 != null)
                {
                    eccfStep2 = ECCFOrderRepository.RebuildStep2Collections(eccfStep2);
                    eccfWizard.Step2 = eccfStep2;
                }

                if (eccfStep3 != null)
                {
                    eccfWizard.Step3 = eccfStep3;
                }

                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFOrderStep4", eccfWizard, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error  in CreateWizardStep4 in ECCFOrderController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [HttpPost]
        public ActionResult Confirmation(CreateECCFOrderStep1ViewModel eccfStep1, CreateECCFOrderStep2ViewModel eccfStep2, CreateECCFOrderStep3ViewModel eccfStep3)
        {
            try
            {
                IECCFOrder eccfOrderRepository = new ECCFOrderRepository();
                CreateECCFOrderWizardViewModel eccfWizard = new CreateECCFOrderWizardViewModel();
                CreateECCFOrderReply createReply = new CreateECCFOrderReply();
                ECCFOrderCreate ECCFOrder = new ECCFOrderCreate();

                if (eccfStep1 != null)
                {
                    eccfWizard.Step1 = eccfStep1;
                }

                if (eccfStep2 != null)
                {
                    eccfStep2 = ECCFOrderRepository.RebuildStep2Collections(eccfStep2);
                    eccfWizard.Step2 = eccfStep2;
                }

                if (eccfStep3 != null)
                {
                    eccfWizard.Step3 = eccfStep3;
                }

                ViewBag.ECCFOrder = eccfWizard;

                ECCFOrder = eccfWizard.MakeECCFOrder();
                createReply = eccfOrderRepository.Create(ECCFOrder);

                if (createReply.OrderReply == "Declined")
                {
                    StringBuilder errStrBuilder = new StringBuilder();

                    foreach (string errorMessage in createReply.OrderResponseMessages)
                    {
                        errStrBuilder.Append(" " + errorMessage);
                    }

                    ErrorSignal.FromCurrentContext().Raise(new Exception("TestTracWS Error:" + errStrBuilder.ToString())); // Send error to ELMAH for logging purposes
                    // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                    Utility.Log(NLogLogger.LogLevel.Error, "catch in Confirmation in ECCFOrderController", GetType().FullName, new Exception("TestTracWS Error:" + errStrBuilder.ToString()));
                    Response.StatusCode = 400;
                    //ModelState.AddModelError(string.Empty, "An error occured while displaying the page. Order could not be created at this time. Please try again.");
                    //return View(new CreateECCFOrderReply());
                    return Content("An error occured while displaying the page. Order could not be created at this time. Please try again.");
                }
                else
                {
                    ViewBag.ECCFOrder = eccfWizard;

                    return PartialView("_ECCFOrderConfirmation", createReply);
                }
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex);
                // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Confirmation in ECCFOrderController", GetType().FullName, ex);
                Response.StatusCode = 400;
                ModelState.AddModelError(string.Empty, "An error occured while displaying the page. Order could not be created at this time. Please try again.");
                return View(new CreateECCFOrderReply());
            }
        }

        [HttpPost]
        public ActionResult EditConfirmation(CreateECCFOrderStep1ViewModel eccfStep1, CreateECCFOrderStep2ViewModel eccfStep2, CreateECCFOrderStep3ViewModel eccfStep3, string OrderConfirmationNumber)
        {
            try
            {
                // NOTE: We are mapping the ECCF Order Create model values into an ECCF Order Modify model for sake of ease and the fact that the object models are similar
                IECCFOrder eccfOrderRepository = new ECCFOrderRepository();
                CreateECCFOrderWizardViewModel eccfWizard = new CreateECCFOrderWizardViewModel();
                ModifyECCFOrderReply modifyReply = new ModifyECCFOrderReply();
                ECCFOrderCreate CreateECCFOrder = new ECCFOrderCreate();
                ECCFOrderModify ModifyECCFOrder;

                // Combine each of the ECCF wizard steps objects into a single Create ECCF Order Wizard model
                if (eccfStep1 != null)
                {
                    // Combine Step 1
                    eccfWizard.Step1 = eccfStep1;
                }

                if (eccfStep2 != null)
                {   
                    // Combine Step 2
                    eccfStep2 = ECCFOrderRepository.RebuildStep2Collections(eccfStep2);
                    eccfWizard.Step2 = eccfStep2;
                }

                if (eccfStep3 != null)
                {
                    // Combine Step 3
                    eccfWizard.Step3 = eccfStep3;
                }

                ViewBag.ECCFOrder = eccfWizard;

                // Get an Create ECCF Order object from a Create ECCF Wizard Object                
                CreateECCFOrder = eccfWizard.MakeECCFOrder();

                // Map Create ECCF Order object to a Modify ECCF Order object
                Mapper.CreateMap<ECCFOrderCreate, ECCFOrderModify>();
                ModifyECCFOrder = Mapper.Map<ECCFOrderCreate, ECCFOrderModify>(CreateECCFOrder);
                ModifyECCFOrder.OrderConfirmationNumber = OrderConfirmationNumber;

                modifyReply = eccfOrderRepository.Modify(ModifyECCFOrder);

                if (modifyReply.OrderReply == "Declined")
                {
                    StringBuilder errStrBuilder = new StringBuilder();

                    foreach (string errorMessage in modifyReply.OrderResponseMessages)
                    {
                        errStrBuilder.Append(" " + errorMessage);
                    }

                    ErrorSignal.FromCurrentContext().Raise(new Exception("TestTracWS Error:" + errStrBuilder.ToString())); // Send error to ELMAH for logging purposes
                    // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                    Utility.Log(NLogLogger.LogLevel.Error, "catch in EditConfirmation in ECCFOrderController", GetType().FullName, new Exception("TestTracWS Error:" + errStrBuilder.ToString()));
                    Response.StatusCode = 400;
                    ModelState.AddModelError(string.Empty, "An error occured while displaying the page. Order could not be modified at this time. Please try again.");
                    //return View(new CreateECCFOrderReply());
                    //return Json(new { OrderReply = modifyReply.OrderReply });
                    return Content("An error occured while Editing the order. Order could not be updated at this time. Please try again.");
                }
                else
                {
                    return Json(new { OrderReply = modifyReply.OrderReply });
                    //ViewBag.ECCFOrder = eccfWizard;

                    //return PartialView("_ECCFOrderConfirmation", ModifyECCFOrder);
                }
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex);
                // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                Utility.Log(NLogLogger.LogLevel.Error, "Error in EditConfirmation in ECCFOrderController", GetType().FullName, ex);
                Response.StatusCode = 400;
                //ModelState.AddModelError(string.Empty, "An error occured while displaying the page. Order could not be created at this time. Please try again.");
                //return View(new CreateECCFOrderReply());
                return Json(new { OrderReply = "Declined" });
            }
        }

        [HttpGet]
        public ActionResult EditWizard(string id)
        {
            try
            {
                if (Utility.VerifyConfirmNumber(id))
                {
                    IECCFOrder eccfOrder = new ECCFOrderRepository();
                    //IClientLab clientLabRepository = new ClientLabRepository();

                    ECCFOrderListItem eccfOrderListItem = eccfOrder.GetECCFOrderListItem(id);

                    EditECCFOrderWizardViewModel eccfWizard = new EditECCFOrderWizardViewModel(eccfOrderListItem);

                    ViewBag.id = id;
                    return View(eccfWizard);
                }
                else
                {
                    return RedirectToAction("Index", "Dashboard");
                }              
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in EditWizard in ECCFOrderController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return RedirectToAction("Index", "Dashboard");
            }
        }

        //public ActionResult Edit(string id)
        //{
        //    try
        //    {
        //        if (Utility.VerifyConfirmNumber(id))
        //        {
        //            IECCFOrder eccfOrder = new ECCFOrderRepository();
        //            IClientLab clientLabRepository = new ClientLabRepository();

        //            ECCFOrderListItem eccfOrderListItem = eccfOrder.GetECCFOrderListItem(id);
        //            ECCFOrderModify eccfOrderModify = eccfOrderListItem.GetECCFOrder();

        //            eccfOrderModify.Labs = clientLabRepository.GetClientLabsList(SessionData.CompanyId);

        //            return View(eccfOrderModify);
        //        }
        //        else
        //        {
        //            return RedirectToAction("Index", "Dashboard");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Utility.Log(NLogLogger.LogLevel.Error, "Error in Edit in ECCFOrderController", GetType().FullName, ex);
        //        ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
        //        return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
        //    }
        //}

        [HttpPost]
        public ActionResult Edit(string id, FormCollection collection)
        {
            try
            {
                if (Utility.VerifyConfirmNumber(id))
                {
                    return RedirectToAction("Index");
                }
                else
                {
                    return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                }
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Edit in ECCFOrderController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                // return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                return View();
            }
            //catch
            //{
            //    return View();
            //}
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Delete(string orderConfirmationNum)
        {
            try
            {

                if (Utility.VerifyConfirmNumber(orderConfirmationNum))
                {
                    IECCFOrder eccfOrder = new ECCFOrderRepository();
                    DeleteECCFOrderReply deleteReply = new DeleteECCFOrderReply();

                    deleteReply = eccfOrder.Delete(orderConfirmationNum);

                    if (deleteReply.OrderReply == "Declined")
                    {
                        StringBuilder errStrBuilder = new StringBuilder();

                        foreach (string errorMessage in deleteReply.OrderResponseMessages)
                        {
                            errStrBuilder.Append(" " + errorMessage);
                        }

                        ErrorSignal.FromCurrentContext().Raise(new Exception("TestTracWS Error:" + errStrBuilder.ToString())); // Send error to ELMAH for logging purposes
                        Utility.Log(NLogLogger.LogLevel.Error, "Error in Delete in ECCFOrderController", GetType().FullName, new Exception("TestTracWS Error:" + errStrBuilder.ToString()));
                        //return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                        Response.StatusCode = 400;
                        return Content("An error occured while Deleted the order. Order could not be Deleted at this time. Please try again.");
                        //reset delete botton
                    }
                    else
                    {
                        
                        return new HttpStatusCodeResult(200);
                        
                        //return RedirectToAction("Index");
                    }
                }
                else
                {
                    return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                }
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Delete in ECCFOrderController", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

    }
}
