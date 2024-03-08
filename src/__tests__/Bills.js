/**
 * @jest-environment jsdom
 */
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import store from "../__mocks__/store.js"
import router from "../app/Router.js";

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  beforeEach(() => {
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.append(root)
    router()
  })
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.getAttribute('id')).toEqual('layout-icon1')
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I navigate to Bills", () => {
    test("Then fetches bills from mock API GET", async () => {
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
      const tabBills = await bills.getBills()

      expect(tabBills.length).toBe(4)
    })
    test("Then display display new bill", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills)
      const nbills = new Bills({
        document, onNavigate : window.onNavigate, store, localStorage: window.localStorage
      })
      await waitFor(() => screen.getAllByTestId("icon-eye"))
      const allIcon = [...screen.getAllByTestId("icon-eye")]
      const handleClickIconEye = jest.fn((e) => {
        nbills.handleClickIconEye(e)
      })

      allIcon[0].addEventListener('click', handleClickIconEye(allIcon[0]))
      fireEvent.click(allIcon[0])

      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByTestId('modaleFile')).toBeTruthy()
    })
  })
  describe("Given I am a user connected as Employee", () => {
    describe("When an error occurs on API", () => {
      test("Then fetches bills from an API and fails with 404 message error", async () => {
        document.body.innerHTML = BillsUI({ error: "Erreur 404" })
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
      test("Then fetches messages from an API and fails with 500 message error", async () => {
        document.body.innerHTML = BillsUI({ error: "Erreur 500" })
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
    
  })
  
})
