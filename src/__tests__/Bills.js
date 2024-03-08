/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import store from "../__mocks__/store.js"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import { data } from "jquery";

/*import store from "../__mocks__/store.js"
import userEvent from '@testing-library/user-event'
import { localStorageMock } from "../__mocks__/localStorage.js"

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))
let bills*/

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))


/*import $ from 'jquery';
global.$ = $;
global.jQuery = $;*/

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.getAttribute('id')).toEqual('layout-icon1')
      
    })

    /* ajouter un test d'intégration POST new bill */

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      //console.log(document.body.innerHTML)
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Nouvelle note de frais"))
      const note = screen.getByText("Nouvelle note de frais")
      expect(note).toBeTruthy()
      const contentType  = await screen.getByText("Type")
      expect(contentType).toBeTruthy()
      const contentNom  = await screen.getByText("Nom")
      expect(contentNom).toBeTruthy()
      const contentDate = await screen.getByText("Date")
      expect(contentDate).toBeTruthy()
      const contentMontant  = await screen.getByText("Montant")
      expect(contentMontant).toBeTruthy()
      const contentStatut  = await screen.getByText("Statut")
      expect(contentStatut).toBeTruthy()
      const contentActions  = await screen.getByText("Actions")
      expect(contentActions).toBeTruthy()


    })
    test("Then display bills", async () => {
      
      const bills = new Bills({
        document, onNavigate : window.onNavigate, store, localStorage: window.localStorage
      })
      //console.log(bills)
      const tabBills = await bills.getBills()
      expect(tabBills.length).toBe(4)
      
    })

    test("Then display display new bill", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const note = screen.getByText("Nouvelle note de frais")

      const nbills = new Bills({
        document, onNavigate : window.onNavigate, store, localStorage: window.localStorage
      })
      
      const handleClickNewBill = jest.fn(() => {
        nbills.handleClickNewBill()
      })

      note.addEventListener('click', handleClickNewBill())

      fireEvent.click(note)
      expect(handleClickNewBill).toHaveBeenCalled()
    })
    
    test("Then I click for display a image of a bill", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      /*
      window.$ = jest.fn().mockImplementation(() => {
        return {
           modal: jest.fn()
         }
      });*/
      $.fn.modal = jest.fn()
      //console.log(document.body.classList)
      const nbills = new Bills({
        document, onNavigate : window.onNavigate, store, localStorage: window.localStorage
      })
      await waitFor(() => screen.getAllByTestId("icon-eye"))
      const allIcon = [...screen.getAllByTestId("icon-eye")]
      const handleClickIconEye = jest.fn((e) => {
        nbills.handleClickIconEye(e)
        //.bind(nbills)
      })

      allIcon[0].addEventListener('click', handleClickIconEye(allIcon[0]))

      fireEvent.click(allIcon[0])

      console.log(document.body.classList)
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByTestId('modaleFile')).toBeTruthy()
         
    })
    
  })
  // test d'intégration GET
  
  describe("Given I am a user connected as Employee", () => {
    
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
      test("Then fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        document.body.innerHTML = BillsUI({ error: "Erreur 404" })
        const message = await screen.getByText(/Erreur 404/)
        
        expect(message).toBeTruthy()
      })
      test("Then fetches messages from an API and fails with 500 message error", async () => {
        
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})
        
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick)
        document.body.innerHTML = BillsUI({ error: "Erreur 500" })
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
        
      })
    })
    
  })
  
})
