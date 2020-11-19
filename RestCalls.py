import tableauserverclient as TSC
import sys
import os

SERVER_NAME = "https://tabapacshowcase.com"
SERVER_SITE = 'PFG'
SERVER_USERNAME = "admin"
SERVER_PASSWORD = "Tableau123"
WORKBOOK_NAME = "Superstore"
PREVIEW_FOLDER_LOCATION = os.getcwd() + "/static/images/previews/"
PREVIEW_FILE_EXTENSION = ".png"

def setDefaultEncoding ():
    reload(sys)
    sys.setdefaultencoding('windows-1250')
    return

def retrieveServerInfo ():
    return SERVER_NAME, SERVER_SITE, WORKBOOK_NAME

def setPagination ():
    return TSC.RequestOptions(pagesize=1000)

# def removeFiles():
#     try:
#         cwd = PREVIEW_FOLDER_LOCATION
#         for f in os.listdir(cwd):
#             if re.search(PREVIEW_FILE_EXTENSION, f):
#                 os.remove(os.path.join(cwd, f))
#     except OSError, e:
#         pass
#     return

def getUsersName(username):
    index = username.find ('@')
    return username[:index]

def stripCharacter (name):
    name = name.replace (" ", "")
    name = name.replace ("?", "")
    name = name.replace (".", "_")
    name = name.replace ("&", "")
    name = name.replace ("(", "")
    name = name.replace (")", "")
    return name

def loginToServer ():
    server = TSC.Server(SERVER_NAME)
    tableau_auth = TSC.TableauAuth(SERVER_USERNAME, SERVER_PASSWORD)
    #Logging into Server
    # try :
    server.auth.sign_in(tableau_auth)
    isUserLoggedInToServer = True
    # except:
        # isUserLoggedInToServer = False
    
    return server, isUserLoggedInToServer

def showViews():
    request_options = setPagination()
    views = []
    server, isUserLoggedInToServer = loginToServer()
    
    if isUserLoggedInToServer == True:
        request_options.filter.add(TSC.Filter(TSC.RequestOptions.Field.Name,
                             TSC.RequestOptions.Operator.Equals,
                             WORKBOOK_NAME))
        
        # try:   
        all_workbook_items, pagination_item = server.workbooks.get(request_options)
        for j in all_workbook_items:
            print (j.name)
            # try:
            server.workbooks.populate_views(j)
            for i in j.views:
                views.append(i.name)
                server.views.populate_preview_image(i)

                with open(PREVIEW_FOLDER_LOCATION+i.name+PREVIEW_FILE_EXTENSION, 'wb') as f:
                    f.write(i.preview_image)
                f.close()

        #         except:
        #             pass
        # except:
        #     pass

    return views

    