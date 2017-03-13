using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Elmah;
using TestTrac.Models;
using TestTrac.Models.Repositories;
using TestTrac.Models.ViewModels;
using TestTrac.Common;
using TestTrac.Common.CustomAttributes;
using AutoMapper;
using TestTrac.Common.Logging.NLog;
using System.Text;
using System.Diagnostics;

namespace TestTrac.Controllers
{
    [SessionExpiryCheck]
    [AjaxAuthorize]
    [Authorize(Roles = "Collector, Admin")]
    [NoCache]
    public class ECCFCollectionController : Controller
    {
        //
        // GET: /ECCFCollection/

        public ActionResult Index(string Filter = "", string id = "", string e = "")
        {
            ECCFCollectionCriterion eccfCollectionCriterion = new ECCFCollectionCriterion();
            IECCFCollection eccfCollection = new ECCFCollectionRepository();

            Debug.WriteLine(Request.UrlReferrer);

            try
            {
                ECCFCollectionList eccfCollectionList;

                if (Request.UrlReferrer != null && (Request.UrlReferrer.ToString().Contains("CreateHybrid") || Request.UrlReferrer.ToString().Contains("CreatePOC")))
                {
                    if (Filter == "COMPLETE")
                    {
                        ViewBag.CompleteMessage = Utility.ECCFCollectionsActionMessage(id, "SUBMITTED", e);
                        ViewBag.CompleteValue = e;
                        ViewBag.Filter = Filter;
                    }
                    else if (Filter == "SUSPENDED")
                    {
                        ViewBag.CompleteMessage = Utility.ECCFCollectionsActionMessage(id, "SUSPENDED", e);
                        ViewBag.CompleteValue = e;
                    }
                    else
                    {
                        ViewBag.CancelMessage = Utility.ECCFCollectionsActionMessage(id, "CANCELED", e);
                        ViewBag.CancelValue = e;
                    }
                }


                if (Filter != "")
                {
                    eccfCollectionList = eccfCollection.GetECCFCollectionList(LastNDays: "30");
                }
                else
                {
                    eccfCollectionList = eccfCollection.GetECCFCollectionList(CollectionStatus: "NULL");
                }

                List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                // Automap Domain Model object to View Model object
                Mapper.CreateMap<ECCFCollectionListItem, ECCFCollectionListTableViewModel>();
                List<ECCFCollectionListTableViewModel> ECCFCollectionVM = Mapper.Map<List<ECCFCollectionListItem>, List<ECCFCollectionListTableViewModel>>(ECCFCollectionDM);

                return View(ECCFCollectionVM);
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex);
                // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                Utility.Log(NLogLogger.LogLevel.Error, "Error in index inside ECCFCollectionController", GetType().FullName, ex);
                Response.StatusCode = 400;
                ModelState.AddModelError(string.Empty, "An error occured while displaying the page.");
                return View(new List<ECCFCollectionListItem>());
            }
        }

        //
        // GET: /ECCFCollection/Details/5

        public ActionResult Details(string id)
        {
            try
            {
                if (Utility.VerifyConfirmNumber(id))
                {
                    IECCFCollection eccfCollection = new ECCFCollectionRepository();
                    ECCFCollectionList eccfCollectionList = eccfCollection.GetECCFCollectionList(OrderConfirmationNumber: id);

                    ECCFCollectionListItemViewModel ECCFCollectionVM = new ECCFCollectionListItemViewModel();
                    List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                    // Automap Domain Model object to View Model object
                    Mapper.CreateMap<ECCFCollectionListItem, ECCFCollectionListItemViewModel>();
                    ECCFCollectionVM = Mapper.Map<ECCFCollectionListItem, ECCFCollectionListItemViewModel>(ECCFCollectionDM[0]);

                    return View(ECCFCollectionVM);
                }
                else
                {
                    return RedirectToAction("Index", "Dashboard");
                }
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in details in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        //
        // GET: /ECCFCollection/Create
        public ActionResult Create(string id = "")
        {
            try
            {
                return RedirectToAction("CreateWizard", "ECCFCollection");
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in /ECCFCollection/Create", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        public ActionResult CreateHybridMenu()
        {
            return RedirectToAction("CreateHybrid", "ECCFCollection");
        }

        // GET: /ECCFCollection/CreatePOC
        public ActionResult CreatePOC(string id = "")
        {
            try
            {
                CreateECCFCollectionPOC ECCFCollectionVM = new CreateECCFCollectionPOC();

                if (id != "")
                {
                    IECCFCollection eccfCollection = new ECCFCollectionRepository();
                    ECCFCollectionList eccfCollectionList = eccfCollection.GetECCFCollectionList(OrderConfirmationNumber: id);

                    if (eccfCollectionList[0].CollectionStatus != "Collection In Process" && eccfCollectionList[0].CollectionStatus != "Donor On Site" && eccfCollectionList[0].CollectionStatus != "Collection Pending" && eccfCollectionList[0].CollectionStatus != "Collection Suspended" && eccfCollectionList[0].CollectionStatus != "Processing")
                    { return RedirectToAction("Index", "ECCFCollection"); }

                    List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                    // Automap Domain Model object to View Model object
                    Mapper.CreateMap<ECCFCollectionListItem, CreateECCFCollectionPOC>().ForMember(d => d.DateOfBirth, o => o.MapFrom(src => (Convert.ToDateTime(src.DateOfBirth))));
                    ECCFCollectionVM = Mapper.Map<ECCFCollectionListItem, CreateECCFCollectionPOC>(ECCFCollectionDM[0]);

                    if (ECCFCollectionVM.CollectionStatus != "Collection In Process" && Utility.EditableStatus(ECCFCollectionVM.CollectionStatus) && Utility.VerifyConfirmNumber(id) && Utility.EditableStatusSQL(ECCFCollectionVM.OrderConfirmationNumber)) { new UtilityRepository().ChangeStatus(id, "Collection In Process"); }
                }

                for (int i = 0; i < ECCFCollectionVM.BodySpecimens.Count; i++)
                {
                    if (ECCFCollectionVM.BodySpecimens[i].Value == ECCFCollectionVM.BodySpecimen) { ECCFCollectionVM.BodySpecimens[i].Selected = true; }
                    else { ECCFCollectionVM.BodySpecimens[i].Selected = false; }

                    if (ECCFCollectionVM.BodySpecimen == null)
                    {
                        if (ECCFCollectionVM.BodySpecimens[i].Value == "URINE")
                        {
                            ECCFCollectionVM.BodySpecimens[i].Selected = true;
                            ECCFCollectionVM.BodySpecimen = "URINE";
                        }
                    }
                }

                if (ECCFCollectionVM.EmployerCompanyName != SessionData.CompanyName &&
                    !IsCollectionNameinList(ECCFCollectionVM.EmployerCompanyNames, ECCFCollectionVM.ClientId))
                { ECCFCollectionVM.EmployerCompanyNames.Add(new SelectListItem() { Text = ECCFCollectionVM.EmployerCompanyName, Value = ECCFCollectionVM.ClientId, Selected = true }); }

                foreach (SelectListItem temp in ECCFCollectionVM.EmployerCompanyNames)
                {
                    if (temp.Value != ECCFCollectionVM.ClientId) { temp.Selected = false; }
                    else { temp.Selected = true; }
                }

                if (ECCFCollectionVM.TestCode != "" && ECCFCollectionVM.TestCode != null)
                {
                    ECCFCollectionVM.TestCodes.Add(new SelectListItem() { Text = ECCFCollectionVM.TestCode, Value = ECCFCollectionVM.TestCode, Selected = true });
                }

                if (ECCFCollectionVM.ClientId == SessionData.CompanyId) { ECCFCollectionVM.Edited = true; }

                if (id != "")
                {
                    ECCFCollectionVM.TestId = ECCFCollectionVM.OrderConfirmationNumber;
                }

                return View(ECCFCollectionVM);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GET /ECCFCollection/CreatePOC", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return View();
            }
        }

        // POST: /ECCFCollection/CreateHybrid
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreatePOC(CreateECCFCollectionPOC eccfCollectionVM, string orderConfirmationNumber = "")
        {
            try
            {
                if (!ModelState.IsValid) { return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "CreatePOC", eccfCollectionVM, this.ViewData, this.TempData), isValid = ModelState.IsValid }); }
                ECCFCollection eccfCollectionDM = new ECCFCollection();
                IECCFCollection eccfCollectionRepository = new ECCFCollectionRepository();
                IUtility utilityRepository = new UtilityRepository();
                SubmitECCFCollectionReply submitReply = new SubmitECCFCollectionReply();

                // Set values before submission (NOTE: Find better way to do this in the future. This is a quick fix)
                switch (eccfCollectionVM.TestType)
                {
                    case "HRS":
                        eccfCollectionVM.StateECCF = true;
                        break;
                    case "SAP":
                        eccfCollectionVM.ForensicECCF = true;
                        break;
                    case "DOT":
                        eccfCollectionVM.FederalECCF = true;
                        break;
                }

                // Set values before submission (NOTE: Find better way to do this in the future. This is a quick fix)
                switch (eccfCollectionVM.CollectionStatus)
                {
                    case "Negative":
                    case "Non-Negative":
                        eccfCollectionVM.CollectionStatus = "Collection Complete";
                        break;
                }

                CollectionSiteListItem Site = new CollectionSiteListItem();
                Site = new UtilityRepository().GetCollectionSiteAddressFromAssociatedClientId(SessionData.CompanyId, eccfCollectionVM.LabId);

                if (Site.Address2 != null && Site.Address2 != "") { Site.Address1 = Site.Address1 + " " + Site.Address2; }

                // Automap site info to Domain Model
                Mapper.CreateMap<CollectionSiteListItem, ECCFCollection>()
                    .ForMember(dest => dest.CollectionSiteCode, opt => opt.MapFrom(src => src.CollectionSiteCode))
                    .ForMember(dest => dest.CollectionSiteAddress, opt => opt.MapFrom(src => src.Address1))
                    .ForMember(dest => dest.CollectionSiteCity, opt => opt.MapFrom(src => src.City))
                    .ForMember(dest => dest.CollectionSiteZip, opt => opt.MapFrom(src => src.Zip))
                    .ForMember(dest => dest.CollectionSiteState, opt => opt.MapFrom(src => src.State))
                    .ForMember(dest => dest.CollectionSitePhone, opt => opt.MapFrom(src => src.PrimaryPhoneNumber))
                    .ForMember(dest => dest.CollectionSiteName, opt => opt.MapFrom(src => src.CollectionSiteName));
                eccfCollectionDM = Mapper.Map<CollectionSiteListItem, ECCFCollection>(Site);

                ClientInfo Employer = new ClientInfo();
                Employer = new UtilityRepository().GetClientInfoFromDatabase(eccfCollectionVM.ClientId);

                if (Employer.Line2 != null && Employer.Line2 != "") { Employer.Line1 = Employer.Line1 + " " + Employer.Line2; }

                // Automap employer info to Domain Model
                Mapper.CreateMap<ClientInfo, ECCFCollection>()
                    .ForMember(dest => dest.EmployerCompanyName, opt => opt.MapFrom(src => src.ClientName))
                    .ForMember(dest => dest.EmployerPhone, opt => opt.MapFrom(src => src.Phone))
                    .ForMember(dest => dest.EmployerFax, opt => opt.MapFrom(src => src.FaxNumber))
                    .ForMember(dest => dest.EmployerAddress, opt => opt.MapFrom(src => src.Line1))
                    .ForMember(dest => dest.EmployerCity, opt => opt.MapFrom(src => src.City))
                    .ForMember(dest => dest.EmployerState, opt => opt.MapFrom(src => src.StateOrProvince))
                    .ForMember(dest => dest.EmployerZip, opt => opt.MapFrom(src => src.PostalCode))
                    .ForMember(dest => dest.EmployerContactFirstName, opt => opt.MapFrom(src => src.FirstName))
                    .ForMember(dest => dest.EmployerContactLastName, opt => opt.MapFrom(src => src.LastName));
                Mapper.Map<ClientInfo, ECCFCollection>(Employer, eccfCollectionDM);

                // Automap Domain Model object to View Model object
                Mapper.CreateMap<CreateECCFCollectionPOC, ECCFCollection>()
                    .ForMember(d => d.DateOfBirth, o => o.MapFrom(src => Convert.ToDateTime(src.DateOfBirth).ToString("yyyy/MM/dd")))
                    .ForMember(d => d.__DateOfBirth, o => o.Ignore()); ;
                Mapper.Map<CreateECCFCollectionPOC, ECCFCollection>(eccfCollectionVM, eccfCollectionDM);

                submitReply = eccfCollectionRepository.Create(eccfCollectionDM, eccfCollectionVM.OrderConfirmationNumber);

                if (submitReply.CollectionReply == "Declined")
                {
                    StringBuilder errStrBuilder = new StringBuilder();

                    foreach (string errorMessage in submitReply.CollectionResponseMessages)
                    {
                        errStrBuilder.Append(" " + errorMessage);
                    }

                    ErrorSignal.FromCurrentContext().Raise(new Exception("TestTracWS Error:" + errStrBuilder.ToString())); // Send error to ELMAH for logging purposes
                    // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                    Utility.Log(NLogLogger.LogLevel.Error, "catch in Create Hybrid in ECCFCollectionController", GetType().FullName, new Exception("TestTracWS Error:" + errStrBuilder.ToString()));
                    Response.StatusCode = 400;
                    ModelState.AddModelError(string.Empty, "An error occured while displaying the page. Order could not be modified at this time. Please try again.");
                    return Content("An error occured while Editing the order. Order could not be updated at this time. Please try again.");
                }
                else { return Json(new { isValid = ModelState.IsValid, ConfirmationNumber = submitReply.CollectionConfirmationNumber, Status = eccfCollectionVM.CollectionStatus }); }
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "activated catch in CreatePOC post in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        // GET: /ECCFCollection/CreateHybrid
        public ActionResult CreateHybrid(string id = "")
        {
            try
            {
                CreateECCFCollectionHybrid ECCFCollectionVM = new CreateECCFCollectionHybrid();

                if (id != "")
                {
                    IECCFCollection eccfCollection = new ECCFCollectionRepository();
                    ECCFCollectionList eccfCollectionList = eccfCollection.GetECCFCollectionList(OrderConfirmationNumber: id);

                    if (eccfCollectionList[0].CollectionStatus != "Collection In Process" && eccfCollectionList[0].CollectionStatus != "Donor On Site" && eccfCollectionList[0].CollectionStatus != "Collection Pending" && eccfCollectionList[0].CollectionStatus != "Collection Suspended" && eccfCollectionList[0].CollectionStatus != "Processing")
                    {return RedirectToAction("Index", "ECCFCollection");}

                    List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                    // Automap Domain Model object to View Model object
                    Mapper.CreateMap<ECCFCollectionListItem, CreateECCFCollectionHybrid>().ForMember(d => d.DateOfBirth, o => o.MapFrom(src => (Convert.ToDateTime(src.DateOfBirth))));
                    ECCFCollectionVM = Mapper.Map<ECCFCollectionListItem, CreateECCFCollectionHybrid>(ECCFCollectionDM[0]);

                    if (ECCFCollectionVM.CollectionStatus != "Collection In Process" && Utility.EditableStatus(ECCFCollectionVM.CollectionStatus) && Utility.VerifyConfirmNumber(id) && Utility.EditableStatusSQL(ECCFCollectionVM.OrderConfirmationNumber)) { new UtilityRepository().ChangeStatus(id, "Collection In Process"); }
                }

                for (int i = 0; i < ECCFCollectionVM.BodySpecimens.Count; i++)
                {
                    if (ECCFCollectionVM.BodySpecimens[i].Value == ECCFCollectionVM.BodySpecimen) { ECCFCollectionVM.BodySpecimens[i].Selected = true; }
                    else { ECCFCollectionVM.BodySpecimens[i].Selected = false; }

                    if (ECCFCollectionVM.BodySpecimen == null)
                    {
                        if (ECCFCollectionVM.BodySpecimens[i].Value == "URINE")
                        {
                            ECCFCollectionVM.BodySpecimens[i].Selected = true;
                            ECCFCollectionVM.BodySpecimen = "URINE";
                        }
                    }
                }
                //EmployerCompanyNames.Add(new SelectListItem() { Text = client.ClientName, Value = client.ClientId, Selected = false });

                if (ECCFCollectionVM.EmployerCompanyName != SessionData.CompanyName &&
                    !IsCollectionNameinList(ECCFCollectionVM.EmployerCompanyNames, ECCFCollectionVM.ClientId))
                { ECCFCollectionVM.EmployerCompanyNames.Add(new SelectListItem() { Text = ECCFCollectionVM.EmployerCompanyName, Value = ECCFCollectionVM.ClientId, Selected = true }); }

                foreach (SelectListItem temp in ECCFCollectionVM.EmployerCompanyNames)
                {
                    if (temp.Value != ECCFCollectionVM.ClientId) { temp.Selected = false; }
                    else { temp.Selected = true; }
                }

                //List<TestingCollectionInfo> ReturnedInfo = new UtilityRepository().GetTestingInfoFromAccountNumberSQL(ECCFCollectionVM.LabAccountNumber);
                //if (!ECCFCollectionVM.TestCodes.Contains(new SelectListItem(){ Text = ECCFCollectionVM.TestCode, Value = ECCFCollectionVM.TestDescription, Selected = true }))

                if (ECCFCollectionVM.TestCode != "" && ECCFCollectionVM.TestCode != null)
                {
                    ECCFCollectionVM.TestCodes.Add(new SelectListItem() { Text = ECCFCollectionVM.TestCode, Value = ECCFCollectionVM.TestCode, Selected = true });
                }

                if (ECCFCollectionVM.ClientId == SessionData.CompanyId) { ECCFCollectionVM.Edited = true; }
                //return View(ECCFCollectionVM);
                return View("CreateHybridTemp", ECCFCollectionVM);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GET /ECCFCollection/CreateHybrid", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                //return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                return View("CreateHybridTemp");
            }
        }

        private bool IsCollectionNameinList(List<SelectListItem> list, string ClientID)
        {
            foreach (SelectListItem temp in list)
            {
                if (temp.Value == ClientID) { return true; }
            }
            return false;
        }

        // POST: /ECCFCollection/CreateHybrid
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateHybrid(CreateECCFCollectionHybrid eccfCollectionVM, string orderConfirmationNumber = "")
        {
            try
            {
                if (!ModelState.IsValid) { return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "CreateHybrid", eccfCollectionVM, this.ViewData, this.TempData), isValid = ModelState.IsValid }); }
                ECCFCollection eccfCollectionDM = new ECCFCollection();
                IECCFCollection eccfCollectionRepository = new ECCFCollectionRepository();
                IUtility utilityRepository = new UtilityRepository();
                SubmitECCFCollectionReply submitReply = new SubmitECCFCollectionReply();

                // Set values before submission (NOTE: Find better way to do this in the future. This is a quick fix)
                switch (eccfCollectionVM.TestType)
                {
                    case "HRS":
                        eccfCollectionVM.StateECCF = true;
                        break;
                    case "SAP":
                        eccfCollectionVM.ForensicECCF = true;
                        break;
                    case "DOT":
                        eccfCollectionVM.FederalECCF = true;
                        break;
                }

                CollectionSiteListItem Site = new CollectionSiteListItem();
                Site = new UtilityRepository().GetCollectionSiteAddressFromAssociatedClientId(SessionData.CompanyId, eccfCollectionVM.LabId);

                if (Site.Address2 != null && Site.Address2 != "") { Site.Address1 = Site.Address1 + " " + Site.Address2; }

                // Automap site info to Domain Model
                Mapper.CreateMap<CollectionSiteListItem, ECCFCollection>()
                    .ForMember(dest => dest.CollectionSiteCode, opt => opt.MapFrom(src => src.CollectionSiteCode))
                    .ForMember(dest => dest.CollectionSiteAddress, opt => opt.MapFrom(src => src.Address1))
                    .ForMember(dest => dest.CollectionSiteCity, opt => opt.MapFrom(src => src.City))
                    .ForMember(dest => dest.CollectionSiteZip, opt => opt.MapFrom(src => src.Zip))
                    .ForMember(dest => dest.CollectionSiteState, opt => opt.MapFrom(src => src.State))
                    .ForMember(dest => dest.CollectionSitePhone, opt => opt.MapFrom(src => src.PrimaryPhoneNumber))
                    .ForMember(dest => dest.CollectionSiteName, opt => opt.MapFrom(src => src.CollectionSiteName));
                eccfCollectionDM = Mapper.Map<CollectionSiteListItem, ECCFCollection>(Site);

                ClientInfo Employer = new ClientInfo();
                Employer = new UtilityRepository().GetClientInfoFromDatabase(eccfCollectionVM.ClientId);

                if (Employer.Line2 != null && Employer.Line2 != "") { Employer.Line1 = Employer.Line1 + " " + Employer.Line2; }

                // Automap employer info to Domain Model
                Mapper.CreateMap<ClientInfo, ECCFCollection>()
                    .ForMember(dest => dest.EmployerCompanyName, opt => opt.MapFrom(src => src.ClientName))
                    .ForMember(dest => dest.EmployerPhone, opt => opt.MapFrom(src => src.Phone))
                    .ForMember(dest => dest.EmployerFax, opt => opt.MapFrom(src => src.FaxNumber))
                    .ForMember(dest => dest.EmployerAddress, opt => opt.MapFrom(src => src.Line1))
                    .ForMember(dest => dest.EmployerCity, opt => opt.MapFrom(src => src.City))
                    .ForMember(dest => dest.EmployerState, opt => opt.MapFrom(src => src.StateOrProvince))
                    .ForMember(dest => dest.EmployerZip, opt => opt.MapFrom(src => src.PostalCode))
                    .ForMember(dest => dest.EmployerContactFirstName, opt => opt.MapFrom(src => src.FirstName))
                    .ForMember(dest => dest.EmployerContactLastName, opt => opt.MapFrom(src => src.LastName));
                Mapper.Map<ClientInfo, ECCFCollection>(Employer, eccfCollectionDM);

                // Automap Domain Model object to View Model object
                Mapper.CreateMap<CreateECCFCollectionHybrid, ECCFCollection>()
                    .ForMember(d => d.DateOfBirth, o => o.MapFrom(src => Convert.ToDateTime(src.DateOfBirth).ToString("yyyy/MM/dd")))
                    .ForMember(d => d.__DateOfBirth, o => o.Ignore()); ;
                Mapper.Map<CreateECCFCollectionHybrid, ECCFCollection>(eccfCollectionVM, eccfCollectionDM);

                submitReply = eccfCollectionRepository.Create(eccfCollectionDM, eccfCollectionVM.OrderConfirmationNumber);

                if (submitReply.CollectionReply == "Declined")
                {
                    StringBuilder errStrBuilder = new StringBuilder();

                    foreach (string errorMessage in submitReply.CollectionResponseMessages)
                    {
                        errStrBuilder.Append(" " + errorMessage);
                    }

                    ErrorSignal.FromCurrentContext().Raise(new Exception("TestTracWS Error:" + errStrBuilder.ToString())); // Send error to ELMAH for logging purposes
                    // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                    Utility.Log(NLogLogger.LogLevel.Error, "catch in Create Hybrid in ECCFCollectionController", GetType().FullName, new Exception("TestTracWS Error:" + errStrBuilder.ToString()));
                    Response.StatusCode = 400;
                    ModelState.AddModelError(string.Empty, "An error occured while displaying the page. Order could not be modified at this time. Please try again.");
                    //return View(new CreateECCFOrderReply());
                    //return Json(new { OrderReply = modifyReply.OrderReply });
                    return Content("An error occured while Editing the order. Order could not be updated at this time. Please try again.");
                }
                else { return Json(new { isValid = ModelState.IsValid, ConfirmationNumber = submitReply.CollectionConfirmationNumber, Status = eccfCollectionVM.CollectionStatus }); }

                //return RedirectToAction("Index");
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "activated catch in CreateHybrid post in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        //
        // POST: /ECCFCollection/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(CreateECCFCollectionViewModel eccfCollectionVM, string orderConfirmationNumber = "")
        {
            try
            {
                ECCFCollection eccfCollectionDM = new ECCFCollection();
                IECCFCollection eccfCollectionRepository = new ECCFCollectionRepository();
                SubmitECCFCollectionReply submitReply = new SubmitECCFCollectionReply();

                eccfCollectionVM.EmployerFax = "9548787888";
                eccfCollectionVM.CollectionDateTime = Convert.ToString(DateTime.Now);
                eccfCollectionVM.EmployeeSignatureDateTime = Convert.ToString(DateTime.Now);

                // Automap Domain Model object to View Model object
                Mapper.CreateMap<CreateECCFCollectionViewModel, ECCFCollection>();
                eccfCollectionDM = Mapper.Map<CreateECCFCollectionViewModel, ECCFCollection>(eccfCollectionVM);

                submitReply = eccfCollectionRepository.Create(eccfCollectionDM, eccfCollectionVM.OrderConfirmationNumber);

                return Content(eccfCollectionVM.EmployeeFirstName);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "activated catch in Create post in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return View();
            }
        }

        public ActionResult CreateWizard(string id = "")
        {
            CreateECCFCollectionWizardViewModel eccfWizard = new CreateECCFCollectionWizardViewModel();

            try
            {
                if (id != "")
                {
                    IECCFCollection eccfCollection = new ECCFCollectionRepository();
                    ECCFCollectionList eccfCollectionList = eccfCollection.GetECCFCollectionList(OrderConfirmationNumber: id);
                    List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                    // Automap Domain Model object to View Model object
                    Mapper.CreateMap<ECCFCollectionListItem, CreateECCFCollectionWizardViewModel>();
                    eccfWizard = Mapper.Map<ECCFCollectionListItem, CreateECCFCollectionWizardViewModel>(ECCFCollectionDM[0]);

                    return View(eccfWizard);
                }
                else
                {
                    return View(eccfWizard);
                }
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "activated catch in CreateWizard in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                //return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                return View(eccfWizard);
            }
            //catch
            //{
            //    return View(eccfWizard);
            //}
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateWizardStep1(CreateECCFCollectionStep1ViewModel eccfStep1)
        {
            try
            {
                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFCollectionStep1", eccfStep1, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in CreateWizardStep1", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateWizardStep2(CreateECCFCollectionStep2ViewModel eccfStep2)
        {
            try
            {
                IECCFCollection eccfCollectionRepository = new ECCFCollectionRepository();
                CreateECCFCollectionWizardViewModel eccfWizard = new CreateECCFCollectionWizardViewModel();
                SubmitECCFCollectionReply submitReply = new SubmitECCFCollectionReply();
                //ECCFCollection eccfCollection = new ECCFCollection();

                IECCFCollection eccfCollection = new ECCFCollectionRepository();
                ECCFCollectionList eccfCollectionList = eccfCollection.GetECCFCollectionList(OrderConfirmationNumber: eccfStep2.OrderConfirmationNumber);
                List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                // Automap Domain Model object to View Model object
                Mapper.CreateMap<ECCFCollectionListItem, CreateECCFCollectionWizardViewModel>();
                eccfWizard = Mapper.Map<ECCFCollectionListItem, CreateECCFCollectionWizardViewModel>(ECCFCollectionDM[0]);


                Mapper.CreateMap<CreateECCFCollectionStep2ViewModel, CreateECCFCollectionWizardViewModel>();
                Mapper.Map<CreateECCFCollectionStep2ViewModel, CreateECCFCollectionWizardViewModel>(eccfStep2, eccfWizard);


                ECCFCollection eccfCollectionDM = new ECCFCollection();

                Mapper.CreateMap<CreateECCFCollectionWizardViewModel, ECCFCollection>();
                eccfCollectionDM = Mapper.Map<CreateECCFCollectionWizardViewModel, ECCFCollection>(eccfWizard);

                //submitReply = eccfCollectionRepository.Create(eccfCollectionDM, eccfWizard.OrderConfirmationNumber);

                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFCollectionStep2", eccfStep2, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in CreateWizardStep2", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult CreateWizardStep3(CreateECCFCollectionStep3ViewModel eccfStep3)
        {
            try
            {
                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFCollectionStep3", eccfStep3, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in CreateWizardStep3", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        // Wizard confirmation step
        [HttpPost]
        public ActionResult CreateWizardStep4(CreateECCFCollectionStep1ViewModel eccfStep1, CreateECCFCollectionStep2ViewModel eccfStep2, CreateECCFCollectionStep3ViewModel eccfStep3)
        {
            try
            {
                CreateECCFCollectionWizardViewModel eccfWizard = new CreateECCFCollectionWizardViewModel();

                if (eccfStep1 != null)
                {
                    eccfWizard.Step1 = eccfStep1;
                }

                if (eccfStep2 != null)
                {
                    eccfWizard.Step2 = eccfStep2;
                }

                if (eccfStep3 != null)
                {
                    eccfWizard.Step3 = eccfStep3;
                }

                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_CreateECCFCollectionStep4", eccfWizard, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in CreateWizardStep4", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [HttpPost]
        public ActionResult Confirmation(CreateECCFCollectionStep1ViewModel eccfStep1, CreateECCFCollectionStep2ViewModel eccfStep2, CreateECCFCollectionStep3ViewModel eccfStep3, bool create = false)
        {
            try
            {
                IECCFCollection eccfCollectionRepository = new ECCFCollectionRepository();
                CreateECCFCollectionWizardViewModel eccfWizard = new CreateECCFCollectionWizardViewModel();
                SubmitECCFCollectionReply submitReply = new SubmitECCFCollectionReply();
                //ECCFCollection eccfCollection = new ECCFCollection();

                IECCFCollection eccfCollection = new ECCFCollectionRepository();
                ECCFCollectionList eccfCollectionList = eccfCollection.GetECCFCollectionList(OrderConfirmationNumber: eccfStep1.OrderConfirmationNumber);
                List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                // Automap Domain Model object to View Model object
                Mapper.CreateMap<ECCFCollectionListItem, CreateECCFCollectionWizardViewModel>();
                eccfWizard = Mapper.Map<ECCFCollectionListItem, CreateECCFCollectionWizardViewModel>(ECCFCollectionDM[0]);

                Mapper.CreateMap<CreateECCFCollectionStep1ViewModel, CreateECCFCollectionWizardViewModel>();
                Mapper.Map<CreateECCFCollectionStep1ViewModel, CreateECCFCollectionWizardViewModel>(eccfStep1, eccfWizard);

                Mapper.CreateMap<CreateECCFCollectionStep2ViewModel, CreateECCFCollectionWizardViewModel>();
                Mapper.Map<CreateECCFCollectionStep2ViewModel, CreateECCFCollectionWizardViewModel>(eccfStep2, eccfWizard);

                Mapper.CreateMap<CreateECCFCollectionStep3ViewModel, CreateECCFCollectionWizardViewModel>();
                Mapper.Map<CreateECCFCollectionStep3ViewModel, CreateECCFCollectionWizardViewModel>(eccfStep3, eccfWizard);

                ECCFCollection eccfCollectionDM = new ECCFCollection();

                Mapper.CreateMap<CreateECCFCollectionWizardViewModel, ECCFCollection>();
                eccfCollectionDM = Mapper.Map<CreateECCFCollectionWizardViewModel, ECCFCollection>(eccfWizard);

                // TODO: Temporary hardcode for presentation purpose. Must change.
                if (create)
                {
                    submitReply = eccfCollectionRepository.Create(eccfCollectionDM, eccfWizard.OrderConfirmationNumber);
                }
                else
                {
                    submitReply.CollectionConfirmationNumber = eccfWizard.OrderConfirmationNumber;
                    submitReply.CollectionReply = "Accepted";
                }

                //TODO: Add logic in view to check for declined collection submissions. User must be alerted that their collection was rejected
                return Json(new { html = Utility.RenderRazorViewToString(this.ControllerContext, "_ECCFCollectionConfirmation", submitReply, this.ViewData, this.TempData), isValid = ModelState.IsValid });
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex);
                // NOTE: Not specifing the key will make the Model Error display in the Validation Summary
                Response.StatusCode = 400;
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Confirmation in ECCFCollectionController", GetType().FullName, ex);
                ModelState.AddModelError(string.Empty, "An error occured while displaying the page. Order code not be created at this time. Please try again.");
                return View(new SubmitECCFCollectionReply());
            }
        }



        //
        // GET: /ECCFCollection/Edit/5

        public ActionResult Edit(int id)
        {
            try
            {
                if (Utility.VerifyConfirmNumber(id.ToString()))
                {
                    return View();
                }
                else
                {
                    return RedirectToAction("Index", "Dashboard");
                }
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Edit in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        //
        // POST: /ECCFCollection/Edit/5

        [HttpPost]
        public ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here
                if (Utility.VerifyConfirmNumber(id.ToString()))
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
                Utility.Log(NLogLogger.LogLevel.Error, "activated catch in Edit post in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                //return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                return View();
            }
            //catch
            //{
            //    return View();
            //}
        }

        //
        // GET: /ECCFCollection/Delete/5

        public ActionResult Delete(int id)
        {
            try
            {
                if (Utility.VerifyConfirmNumber(id.ToString()))
                {
                    return View();
                }
                else
                {
                    return RedirectToAction("Index", "Dashboard");
                }
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in Delete in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        //
        // POST: /ECCFCollection/Delete/5

        [HttpPost]
        public ActionResult Delete(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here
                if (Utility.VerifyConfirmNumber(id.ToString()))
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
                Utility.Log(NLogLogger.LogLevel.Error, "activated catch in Delete post in ECCFCollectionController", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                //return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
                return View();
            }
            //catch
            //{
            //    return View();
            //}
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetPartialViewECCFListTable(string lastNDays = "30", string collectionStatus = "", string orderConfirmationNumber = "", string employeeId = "", string employeeLastName = "", string employeePhone = "", string employerCompanyName = "")
        {
            try
            {
                ECCFCollectionCriterion eccfCollectionCriterion = new ECCFCollectionCriterion();
                IECCFCollection eccfCollection = new ECCFCollectionRepository();

                ECCFCollectionList eccfCollectionList = eccfCollection.GetECCFCollectionList(LastNDays: lastNDays, OrderConfirmationNumber: orderConfirmationNumber,
                    CollectionStatus: collectionStatus, EmployeeId: employeeId, EmployeeLastName: employeeLastName, EmployeePhone: employeePhone, EmployerCompanyName: employerCompanyName);
                List<ECCFCollectionListItem> ECCFCollectionDM = eccfCollectionList.ECCFCollectionCollection.Cast<ECCFCollectionListItem>().ToList();

                // Automap Domain Model object to View Model object
                Mapper.CreateMap<ECCFCollectionListItem, ECCFCollectionListTableViewModel>();
                List<ECCFCollectionListTableViewModel> ECCFCollectionVM = Mapper.Map<List<ECCFCollectionListItem>, List<ECCFCollectionListTableViewModel>>(ECCFCollectionDM);


                return PartialView("_ECCFCollectionListTable", ECCFCollectionVM);
            }
            catch (Exception e)
            {
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GetPartialViewECCFListTable", GetType().FullName, e);
                ErrorSignal.FromCurrentContext().Raise(e); // Send error to ELMAH for logging purposes
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }

        [ValidateAntiForgeryToken]
        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult GetPartialViewECCFCollectionListItem(string orderConfirmationNum)
        {
            ECCFCollectionCriterion eccfCollectionCriterion = new ECCFCollectionCriterion();
            IECCFCollection eccfCollection = new ECCFCollectionRepository();

            try
            {
                //if (!UserIsAuthorized())
                //    return new HttpStatusCodeResult(401, "Custom Error Message 1"); // Unauthorized
                if (!ModelState.IsValid)
                    return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request

                ECCFCollectionListItem eccfCollectionListItem = eccfCollection.GetECCFCollectionListItem(OrderConfirmationNumber: orderConfirmationNum);

                return PartialView("_ECCFOrderModalConfirmation", eccfCollectionListItem);
            }
            catch (Exception ex)
            {
                ErrorSignal.FromCurrentContext().Raise(ex); // Send error to ELMAH for logging purposes
                Utility.Log(NLogLogger.LogLevel.Error, "Error in GetPartialViewECCFCollectionListItem", GetType().FullName, ex);
                return new HttpStatusCodeResult(400, "Bad Request. Try again. If the problem persists contact the web administrator."); // Bad Request
            }
        }
    }
}
