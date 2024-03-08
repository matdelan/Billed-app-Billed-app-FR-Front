/**
 * @jest-environment jsdom
 */

import {screen, fireEvent, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import BillsUI from "../views/BillsUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../__mocks__/store.js"
import mockStore from "../__mocks__/store"
import userEvent from '@testing-library/user-event'
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import router from "../app/Router.js"
import { billTest } from "../__mocks__/bill.js"
import { mockInputFile } from "../__mocks__/inputFile.js"

let newBill
jest.mock("../app/store", () => mockStore);

const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname })
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      document.body.innerHTML = NewBillUI()
      newBill = new NewBill({
        document, onNavigate, store: store, localStorage: window.localStorage
      })
    })
    test("Then I select a type of expense ", async () => {
      await waitFor(() => screen.getByTestId('expense-type'))
      const select = screen.getByTestId('expense-type')
      const amount = waitFor(() => screen.getByTestId('amount'))
      expect(newBill).toBeTruthy()
      expect(select.children[1].textContent).toBe("Restaurants et bars")
      expect(amount).toBeTruthy()
    })
    
    test("Then I select a file", async () => {            
      const handleChangeFile = jest.fn((e) => {
        newBill.handleChangeFile(e)
      })

      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, { target: mockInputFile })

      expect(inputFile.files[0].type).toBe("image/png")
      expect(handleChangeFile).toBeCalled()
      
      const result2 = await newBill.validateImage()
      expect(result2).toBeFalsy()
      
      const result = await newBill.validateImage("image777.png")
      expect(result).toBeTruthy()
  
    })

    test("Then I send a newBill", async () => {
      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(form).toBeTruthy()
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
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
      test("Then test post method", async () => {
        
        const result = await mockStore.bills().update(billTest)

        expect(result).toBeTruthy()
        expect(result.id).toBe("47qAXb6fIm2zOKkLzMro")
      })
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
